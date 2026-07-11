import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Upload, Loader2, ScanLine } from "lucide-react";
import { Alert, Badge, Button, Input, Label } from "../../../components/ui";
import DocumentDetailsTable from "../../components/common/DocumentDetailsTable";
import { validateDocumentDetails } from "../../components/document/documentDetailsValidation";
import PurchaseDetails from "../../../types/PurchaseDetails";
import Purchase from "../../../types/Purchase";
import { purchaseService } from "../../../services/PurchaseService";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { useObjectUrl } from "../../../hooks/useObjectUrl";
import { useToast } from "../../../hooks/useToast";
import { ExtractionResult } from "../../../types/FormExtraction";
import { todayBogota, toDateInputValue } from "../../../utils/date";
import { formatKg } from "../../../utils/format";
import type { ScanImageOptimizationResult } from "../../../services/scanImagePreprocessor";
import { useScanCrop } from "./hooks/useScanCrop";
import { useFormExtraction } from "./hooks/useFormExtraction";
import ScanCropEditor from "./components/ScanCropEditor";
import ScanOptimizationDebug from "./components/ScanOptimizationDebug";

export { EXTRACTION_UI_TIMEOUT_MS } from "./hooks/useFormExtraction";

type Step = "upload" | "processing" | "review";

interface ScanFeedback {
  variant: "info" | "warning" | "danger";
  title: string;
  message: string;
}

/** Deja pintar el paso "processing" antes de bloquear con la extracción. */
const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

/** Filas editables de la compra, a partir de lo que leyó el modelo. */
function buildDetails(result: ExtractionResult): PurchaseDetails[] {
  const supplierId = result.supplier?.personId;
  // Sin match confiable la celda de proveedor queda vacía: precargar el nombre
  // del top-1 invita a guardar sin seleccionar conscientemente.
  const supplierName = supplierId
    ? (result.supplier.candidates?.find((c) => c.id === supplierId)?.name ??
      result.supplier.rawName ??
      "")
    : "";

  if (!result.details) return [];

  return result.details.map((d, i) => ({
    id: -(Date.now() + i),
    productId: d.productId ?? 0,
    product: { id: d.productId ?? 0, name: d.productName },
    personId: supplierId ?? 0,
    person: { id: supplierId ?? 0, name: supplierName },
    weight_kg: d.weightKg,
  }));
}

export default function ScanPurchase() {
  const navigate = useNavigate();
  const { showError, showWarning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [optimized, setOptimized] = useState<ScanImageOptimizationResult | null>(
    null,
  );
  const [scanFeedback, setScanFeedback] = useState<ScanFeedback | null>(null);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  // Estado de revisión (misma forma que usa el alta manual)
  const [date, setDate] = useState<string>(todayBogota());
  const [details, setDetails] = useState<PurchaseDetails[]>([]);

  // Las vistas previas se derivan del blob: crear y revocar el object URL ya no
  // es responsabilidad de cada camino de esta pantalla.
  const previewUrl = useObjectUrl(file);
  const optimizedPreviewUrl = useObjectUrl(optimized?.file);

  const crop = useScanCrop({ onWarning: showWarning });
  const { extract } = useFormExtraction({ onOptimizedImage: setOptimized });

  const { loading: saving, execute: runSave } = useApiRequest(
    (data: Purchase) => purchaseService.createWithDetails(data),
    {
      successMessage: "Compra creada exitosamente",
      errorMessage: "Error al crear la compra",
      showSuccessToast: true,
      onSuccess: () => navigate("/compras"),
    },
  );

  const { detect: detectCrop, reset: resetCrop } = crop;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (!selected) return;
      setFile(selected);
      setOptimized(null);
      setScanFeedback(null);
      resetCrop();
      void detectCrop(selected);
    },
    [detectCrop, resetCrop],
  );

  const handleProcess = async () => {
    if (!file) return;
    setScanFeedback(null);
    setOptimized(null);
    setStep("processing");
    await waitForPaint();

    const outcome = await extract(file, crop.croppedArea);

    if (outcome.status === "timeout") {
      setScanFeedback({
        variant: "warning",
        title: "El procesamiento no terminó a tiempo",
        message: outcome.message,
      });
      showError(outcome.message);
      setStep("upload");
      return;
    }

    if (outcome.status === "error") {
      showError(outcome.message);
      setScanFeedback({
        variant: "danger",
        title: "No se pudo procesar la imagen",
        message: outcome.message,
      });
      setStep("upload");
      return;
    }

    const extracted = outcome.result;
    setResult(extracted);
    setDate(toDateInputValue(extracted.date?.value ?? todayBogota()));
    setDetails(buildDetails(extracted));
    if (extracted.details.length === 0) {
      setScanFeedback({
        variant: "warning",
        title: "Imagen procesada sin valores",
        message:
          "El servidor respondió, pero no encontró valores de Pieles, Sebo o Hueso en el formulario.",
      });
      showWarning(
        "Imagen procesada, pero no encontré valores en el formulario",
      );
    }
    setStep("review");
  };

  const scanAnotherImage = () => {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFile(null);
    setOptimized(null);
    setResult(null);
    setDetails([]);
    setScanFeedback(null);
    resetCrop();
    setStep("upload");
  };

  const adjustCurrentImage = () => {
    setResult(null);
    setDetails([]);
    setScanFeedback(null);
    setStep("upload");
    crop.openEditor();
  };

  const applySupplierToAll = (personId: number, name: string) => {
    setDetails((prev) =>
      prev.map((d) => ({ ...d, personId, person: { id: personId, name } })),
    );
  };

  const handleSave = async () => {
    if (saving) return;
    const visible = details.filter((d) => !d.toDelete);
    if (visible.length === 0) {
      showWarning("Agrega al menos un producto antes de guardar");
      return;
    }
    // Misma regla que el alta manual: producto, proveedor y un peso en rango.
    if (!validateDocumentDetails(visible).isValid) {
      showError(
        "Cada fila debe tener producto, proveedor y peso. Revisa los campos marcados.",
      );
      return;
    }
    await runSave({ date, purchase_details: visible });
  };

  const visibleDetails = details.filter((detail) => !detail.toDelete);
  const hasDetectedDetails = visibleDetails.length > 0;
  const visibleReviewReasons =
    hasDetectedDetails && result
      ? result.reviewReasons.filter(
          (reason) => reason !== "No se detectaron valores de productos",
        )
      : [];
  const detectedWeightKg = visibleDetails.reduce(
    (sum, detail) => sum + Number(detail.weight_kg ?? 0),
    0,
  );

  const optimizationDebug = (
    <ScanOptimizationDebug
      metadata={optimized?.metadata ?? null}
      previewUrl={optimizedPreviewUrl}
    />
  );

  return (
    <section className="mx-auto flex w-full max-w-3xl lg:max-w-5xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-6">
      <header className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon-md"
          onClick={() => navigate("/compras")}
          title="Volver a Compras"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-2">
          <ScanLine className="h-5 w-5 text-(--color-text-secondary)" />
          <h1 className="text-lg font-medium tracking-tight text-(--color-text-primary)">
            Escanear compra
          </h1>
        </div>
      </header>

      {step === "upload" && (
        <div className="flex flex-col gap-5">
          <p className="text-sm text-(--color-text-secondary)">
            Sube o toma una foto clara del formulario. La información se extrae
            automáticamente y podrás revisarla antes de guardar. La imagen no se
            almacena.
          </p>

          {scanFeedback && (
            <Alert
              variant={scanFeedback.variant}
              title={scanFeedback.title}
              onDismiss={() => setScanFeedback(null)}
            >
              <p>{scanFeedback.message}</p>
            </Alert>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <>
              <ScanCropEditor
                previewUrl={previewUrl}
                crop={crop.crop}
                diagnostics={crop.diagnostics}
                isEditing={crop.isEditing}
                isDetecting={crop.isDetecting}
                onToggleEditor={() => void crop.toggleEditor(file)}
                onRedetect={() => file && void crop.redetect(file)}
                onReset={resetCrop}
                onSideChange={crop.setSide}
              />
              {optimizationDebug}
            </>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-(--color-border-strong) bg-(--color-bg-subtle) px-6 py-12 text-center transition-colors hover:border-(--color-action-bg) hover:bg-(--color-bg-muted)"
            >
              <Camera className="h-10 w-10 text-(--color-text-muted)" />
              <span className="text-sm font-medium text-(--color-text-primary)">
                Tomar o subir foto
              </span>
              <span className="text-xs text-(--color-text-muted)">
                JPG o PNG — formulario completo y enfocado
              </span>
            </button>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            {previewUrl && (
              <Button
                variant="outline"
                leftIcon={<Upload className="h-4 w-4" />}
                onClick={() => fileInputRef.current?.click()}
              >
                Cambiar foto
              </Button>
            )}
            <Button variant="primary" disabled={!file} onClick={handleProcess}>
              Procesar
            </Button>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="flex flex-col items-center gap-5 py-10">
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Procesando formulario"
              className="max-h-72 w-full rounded-lg border border-(--color-border) object-contain opacity-70"
            />
          )}
          <div className="flex items-center gap-3 text-(--color-text-secondary)">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">
              Extrayendo información del formulario…
            </span>
          </div>
          {optimizationDebug}
        </div>
      )}

      {step === "review" && result && (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-(--color-border) bg-(--color-bg-surface) p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-medium text-(--color-text-primary)">
                    Resultado del escaneo
                  </h2>
                  <Badge
                    variant={hasDetectedDetails ? "success" : "warning"}
                    withDot
                  >
                    {hasDetectedDetails ? "Valores detectados" : "Sin valores"}
                  </Badge>
                  {hasDetectedDetails && result.needsReview && (
                    <Badge variant="warning" withDot>
                      Requiere revisión
                    </Badge>
                  )}
                </div>
                <p className="mt-1 text-sm text-(--color-text-secondary)">
                  {hasDetectedDetails
                    ? `${visibleDetails.length} producto${visibleDetails.length === 1 ? "" : "s"} · ${formatKg(detectedWeightKg)} kg`
                    : "El modelo leyó la imagen, pero no encontró pesos para crear una compra."}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={adjustCurrentImage}>
                Ajustar imagen
              </Button>
            </div>

            <div className="mt-3 grid gap-2 text-xs text-(--color-text-secondary) sm:grid-cols-3">
              <span>Fecha: {result.date.value ?? "Sin detectar"}</span>
              <span>
                Total formulario:{" "}
                {result.librasTotal.value != null
                  ? `${formatKg(result.librasTotal.value)} lb`
                  : "Sin detectar"}
              </span>
              <span>
                Proveedor: {result.supplier.rawName || "Sin detectar"}
              </span>
            </div>
          </div>

          {optimizationDebug}

          {!hasDetectedDetails && (
            <Alert
              variant="info"
              title="Imagen procesada, sin valores para guardar"
              action={
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={scanAnotherImage}
                  >
                    Escanear otra
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={adjustCurrentImage}
                  >
                    Revisar recorte
                  </Button>
                </div>
              }
            >
              <p className="text-sm">
                La imagen sí llegó al servidor y fue leída por el modelo, pero
                no se detectaron pesos en Pieles, Sebo o Hueso. No se creó
                ninguna compra.
              </p>
            </Alert>
          )}

          {hasDetectedDetails && visibleReviewReasons.length > 0 && (
            <Alert variant="warning" title="Revisa los datos detectados">
              <ul className="list-disc pl-4 text-sm">
                {visibleReviewReasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </Alert>
          )}

          {hasDetectedDetails && result.supplier.needsReview && (
            <Alert variant="info" title="Proveedor por confirmar">
              <p className="text-sm">
                Texto leído: <strong>{result.supplier.rawName || "—"}</strong>.
                Selecciona el proveedor correcto en cada fila
                {result.supplier.candidates.length > 0
                  ? ", o aplica una sugerencia a todas:"
                  : "."}
              </p>
              {result.supplier.candidates.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {result.supplier.candidates.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => applySupplierToAll(c.id, c.name)}
                      className="rounded-full border border-(--color-border) bg-(--color-bg-surface) px-3 py-1 text-xs text-(--color-text-primary) transition-colors hover:bg-(--color-bg-subtle)"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </Alert>
          )}

          {hasDetectedDetails && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="scan-date" required>
                Fecha
              </Label>
              <Input
                type="date"
                id="scan-date"
                name="date"
                value={date}
                required
                onChange={(e) => setDate(e.target.value)}
                className="sm:w-56"
              />
            </div>
          )}

          {hasDetectedDetails && (
            <DocumentDetailsTable<PurchaseDetails>
              details={details}
              setDetails={setDetails}
              mode="add"
              title="Detalles de la compra"
            />
          )}

          {hasDetectedDetails && (
            <div className="flex flex-col gap-2 border-t border-(--color-border) pt-4 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                onClick={scanAnotherImage}
                disabled={saving}
              >
                Escanear otra
              </Button>
              <Button variant="primary" loading={saving} onClick={handleSave}>
                Guardar compra
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
