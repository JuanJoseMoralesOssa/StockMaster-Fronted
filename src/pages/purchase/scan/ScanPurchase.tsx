import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Camera,
  Crop,
  Upload,
  Loader2,
  ScanLine,
  RotateCcw,
} from "lucide-react";
import { Alert, Button, Input, Label } from "../../../components/ui";
import DocumentDetailsTable from "../../components/common/DocumentDetailsTable";
import PurchaseDetails from "../../../types/PurchaseDetails";
import Purchase from "../../../types/Purchase";
import { purchaseService } from "../../../services/PurchaseService";
import { formExtractionService } from "../../../services/FormExtractionService";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { useToast } from "../../../hooks/useToast";
import { ExtractionResult } from "../../../types/FormExtraction";
import { todayBogota } from "../../../utils/date";
import {
  normalizeScanImageCrop,
  ScanImageCrop,
  suggestScanImageCrop,
} from "../../../services/scanImagePreprocessor";

type Step = "upload" | "processing" | "review";
const EXTRACTION_UI_TIMEOUT_MS = 30000;
const MIN_PROCESSING_VISIBLE_MS = 700;
const EMPTY_CROP: ScanImageCrop = { left: 0, top: 0, right: 0, bottom: 0 };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const waitForPaint = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const cropPercent = (value: number) => Math.round(value * 100);
const hasVisibleCrop = (crop: ScanImageCrop) =>
  Object.values(crop).some((value) => value > 0);

/** Build editable purchase-detail rows from the extraction result. */
function buildDetails(result: ExtractionResult): PurchaseDetails[] {
  const supplierId = result.supplier?.personId;
  const supplierName =
    result.supplier?.candidates?.[0]?.name ?? result.supplier?.rawName ?? "";

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState<ScanImageCrop>(EMPTY_CROP);
  const [editingCrop, setEditingCrop] = useState(false);
  const [suggestingCrop, setSuggestingCrop] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);

  // Review state (same shape the manual create form uses)
  const [date, setDate] = useState<string>(todayBogota());
  const [details, setDetails] = useState<PurchaseDetails[]>([]);

  // Revoke object URL on unmount / change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const { execute: runExtraction } = useApiRequest(
    (img: File, scanCrop?: ScanImageCrop) =>
      formExtractionService.extractFromImage(img, { crop: scanCrop }),
    {
      errorMessage: "No se pudo leer el formulario. Intenta con otra foto.",
      onError: () => undefined,
    },
  );

  const { loading: saving, execute: runSave } = useApiRequest(
    (data: Purchase) => purchaseService.createWithDetails(data),
    {
      successMessage: "Compra creada exitosamente",
      errorMessage: "Error al crear la compra",
      showSuccessToast: true,
      onSuccess: () => navigate("/compras"),
    },
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
    setCrop(EMPTY_CROP);
    setEditingCrop(false);
    setSuggestingCrop(false);
  };

  const updateCropSide = (side: keyof ScanImageCrop, value: number) => {
    setCrop((prev) => normalizeScanImageCrop({ ...prev, [side]: value / 100 }));
  };

  const resetCrop = () => {
    setCrop(EMPTY_CROP);
    setEditingCrop(false);
  };

  const applyRecommendedCrop = async () => {
    if (!file || suggestingCrop) return;
    setSuggestingCrop(true);
    try {
      const suggestedCrop = await suggestScanImageCrop(file);
      if (!suggestedCrop) {
        showWarning("No encontré el formulario con suficiente claridad");
        return;
      }
      setCrop(suggestedCrop);
      setEditingCrop(true);
    } catch {
      showWarning("No se pudo calcular el recorte sugerido");
    } finally {
      setSuggestingCrop(false);
    }
  };

  const handleProcess = async () => {
    if (!file) return;
    setStep("processing");
    await waitForPaint();
    const processingStartedAt = Date.now();

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const timeoutResult = Symbol("extraction-timeout");
    const timeoutPromise = new Promise<typeof timeoutResult>((resolve) => {
      timeoutId = setTimeout(
        () => resolve(timeoutResult),
        EXTRACTION_UI_TIMEOUT_MS,
      );
    });

    const scanCrop = hasVisibleCrop(crop) ? crop : undefined;
    const res = await Promise.race([
      runExtraction(file, scanCrop),
      timeoutPromise,
    ]);
    if (timeoutId) clearTimeout(timeoutId);
    await wait(
      Math.max(
        0,
        MIN_PROCESSING_VISIBLE_MS - (Date.now() - processingStartedAt),
      ),
    );

    if (res === timeoutResult) {
      showError(
        "El escaneo está tardando demasiado. Intenta de nuevo en unos segundos.",
      );
      setStep("upload");
      return;
    }

    if (!res) {
      setStep("upload");
      return;
    }

    setResult(res);
    setDate(res.date?.value ?? todayBogota());
    setDetails(buildDetails(res));
    setStep("review");
  };

  const resetToUpload = () => {
    setResult(null);
    setDetails([]);
    setStep("upload");
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
    const incomplete = visible.some(
      (d) =>
        !d.productId ||
        d.productId <= 0 ||
        !d.personId ||
        d.personId <= 0 ||
        !d.weight_kg ||
        d.weight_kg <= 0,
    );
    if (incomplete) {
      showError(
        "Cada fila debe tener producto, proveedor y peso. Revisa los campos marcados.",
      );
      return;
    }
    await runSave({ date, purchase_details: visible });
  };

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-5 sm:px-6 md:py-6">
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

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />

          {previewUrl ? (
            <div className="flex flex-col gap-3">
              <div className="flex justify-center rounded-lg border border-(--color-border) bg-(--color-bg-surface)">
                <div className="relative overflow-hidden">
                  <img
                    src={previewUrl}
                    alt="Vista previa del formulario"
                    className="block max-h-96 max-w-full object-contain"
                  />
                  {editingCrop && (
                    <div className="pointer-events-none absolute inset-0">
                      <div
                        className="absolute left-0 right-0 top-0 bg-black/45"
                        style={{ height: `${cropPercent(crop.top)}%` }}
                      />
                      <div
                        className="absolute bottom-0 left-0 right-0 bg-black/45"
                        style={{ height: `${cropPercent(crop.bottom)}%` }}
                      />
                      <div
                        className="absolute bg-black/45"
                        style={{
                          bottom: `${cropPercent(crop.bottom)}%`,
                          left: 0,
                          top: `${cropPercent(crop.top)}%`,
                          width: `${cropPercent(crop.left)}%`,
                        }}
                      />
                      <div
                        className="absolute bg-black/45"
                        style={{
                          bottom: `${cropPercent(crop.bottom)}%`,
                          right: 0,
                          top: `${cropPercent(crop.top)}%`,
                          width: `${cropPercent(crop.right)}%`,
                        }}
                      />
                      <div
                        className="absolute border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.45)]"
                        style={{
                          bottom: `${cropPercent(crop.bottom)}%`,
                          left: `${cropPercent(crop.left)}%`,
                          right: `${cropPercent(crop.right)}%`,
                          top: `${cropPercent(crop.top)}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant={editingCrop ? "secondary" : "outline"}
                  leftIcon={<Crop className="h-4 w-4" />}
                  onClick={() => setEditingCrop((prev) => !prev)}
                >
                  Recortar foto
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<ScanLine className="h-4 w-4" />}
                  loading={suggestingCrop}
                  onClick={applyRecommendedCrop}
                >
                  Recorte sugerido
                </Button>
                {hasVisibleCrop(crop) && (
                  <Button
                    variant="ghost"
                    leftIcon={<RotateCcw className="h-4 w-4" />}
                    onClick={resetCrop}
                  >
                    Quitar recorte
                  </Button>
                )}
              </div>

              {editingCrop && (
                <div className="grid gap-3 rounded-lg border border-(--color-border) bg-(--color-bg-subtle) p-3 sm:grid-cols-2">
                  {[
                    ["top", "Arriba"],
                    ["bottom", "Abajo"],
                    ["left", "Izquierda"],
                    ["right", "Derecha"],
                  ].map(([side, label]) => (
                    <label
                      key={side}
                      className="flex flex-col gap-1 text-xs font-medium text-(--color-text-secondary)"
                    >
                      <span className="flex items-center justify-between">
                        {label}
                        <span>
                          {cropPercent(crop[side as keyof ScanImageCrop])}%
                        </span>
                      </span>
                      <Input
                        type="range"
                        min={0}
                        max={80}
                        step={1}
                        value={cropPercent(crop[side as keyof ScanImageCrop])}
                        onChange={(event) =>
                          updateCropSide(
                            side as keyof ScanImageCrop,
                            Number(event.target.value),
                          )
                        }
                        className="h-8 px-0"
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
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
        </div>
      )}

      {step === "review" && result && (
        <div className="flex flex-col gap-6">
          {result.reviewReasons.length > 0 && (
            <Alert variant="warning" title="Revisa los datos detectados">
              <ul className="list-disc pl-4 text-sm">
                {result.reviewReasons.map((reason, i) => (
                  <li key={i}>{reason}</li>
                ))}
              </ul>
            </Alert>
          )}

          {result.supplier.needsReview && (
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

          <DocumentDetailsTable<PurchaseDetails>
            details={details}
            setDetails={setDetails}
            mode="add"
            title="Detalles de la compra"
          />

          <div className="flex flex-col gap-2 border-t border-(--color-border) pt-4 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={resetToUpload} disabled={saving}>
              Escanear otra
            </Button>
            <Button variant="primary" loading={saving} onClick={handleSave}>
              Guardar compra
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
