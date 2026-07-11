// @vitest-environment jsdom
/**
 * Tests de componente para ScanPurchase (plan de validación F1–F12):
 * flujo upload → processing → review, chips de proveedor, validación al
 * guardar, manejo de errores/timeout y limpieza de estado.
 *
 * Servicios (extracción, compra, toasts) y DocumentDetailsTable van mockeados;
 * los timers son falsos para controlar el spinner mínimo (700 ms) y el
 * timeout de UI.
 */
import { render, screen, fireEvent, act } from "@testing-library/react";
import ScanPurchase, { EXTRACTION_UI_TIMEOUT_MS } from "../ScanPurchase";
import {
  EXTRACTION_HTTP_TIMEOUT_MS,
  formExtractionService,
} from "../../../../services/FormExtractionService";
import { purchaseService } from "../../../../services/PurchaseService";
import { ToastService } from "../../../../services/ToastService";
import { analyzeScanImageCrop } from "../../../../services/scanImagePreprocessor";
import { todayBogota } from "../../../../utils/date";
import type { ExtractionResult } from "../../../../types/FormExtraction";
import type PurchaseDetails from "../../../../types/PurchaseDetails";

const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock("react-router-dom", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router-dom")>()),
  useNavigate: () => mockNavigate,
}));

// Solo se finge la llamada de red: los timeouts reales del módulo se conservan,
// porque el escalonado entre ellos (UI > HTTP > presupuesto del backend) es parte
// de lo que estos tests protegen.
vi.mock(
  "../../../../services/FormExtractionService",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../services/FormExtractionService")
    >()),
    formExtractionService: { extractFromImage: vi.fn() },
  }),
);

vi.mock("../../../../services/PurchaseService", () => ({
  purchaseService: { createWithDetails: vi.fn() },
}));

vi.mock("../../../../services/ToastService", () => ({
  ToastService: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    loading: vi.fn(),
    close: vi.fn(),
    confirmDelete: vi.fn(),
    confirm: vi.fn(),
  },
}));

vi.mock(
  "../../../../services/scanImagePreprocessor",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("../../../../services/scanImagePreprocessor")
    >()),
    analyzeScanImageCrop: vi.fn(),
  }),
);

// La tabla real carga catálogos desde stores; aquí solo interesa qué filas
// recibe y cómo cambian (proveedor aplicado, pesos).
vi.mock("../../../components/common/DocumentDetailsTable", () => ({
  default: ({ details }: { details: PurchaseDetails[] }) => (
    <table data-testid="details-table">
      <tbody>
        {details
          .filter((d) => !d.toDelete)
          .map((d, i) => (
            <tr key={d.id} data-testid="detail-row">
              <td data-testid={`row-product-${i}`}>{d.product?.name ?? ""}</td>
              <td data-testid={`row-person-${i}`}>{d.person?.name ?? ""}</td>
              <td data-testid={`row-weight-${i}`}>{d.weight_kg}</td>
            </tr>
          ))}
      </tbody>
    </table>
  ),
}));

// ── fixtures ────────────────────────────────────────────────────────────────

const CROP_SUGGESTION = {
  crop: { left: 0.1, top: 0.05, right: 0.1, bottom: 0.05 },
  diagnostics: {
    blueDetected: true,
    paperDetected: true,
    valid: true,
    reason: "Formulario detectado",
    bluePixelsInside: 1200,
  },
};

const NO_CROP = {
  crop: null,
  diagnostics: {
    blueDetected: false,
    paperDetected: false,
    valid: false,
    reason: "No se detectó el formulario",
    bluePixelsInside: 0,
  },
};

function baseResult(
  overrides: Partial<ExtractionResult> = {},
): ExtractionResult {
  return {
    date: { value: "2026-06-11", confidence: 0.95, needsReview: false },
    librasTotal: { value: 140, confidence: 0.9 },
    supplier: {
      rawName: "Juan Jose",
      personId: 12,
      confidence: 1,
      needsReview: false,
      candidates: [
        { id: 12, name: "Juan José", score: 1 },
        { id: 7, name: "Juan Pérez", score: 0.55 },
        { id: 21, name: "José Juárez", score: 0.42 },
      ],
    },
    details: [
      {
        fieldName: "pieles",
        productId: 3,
        productName: "Pieles",
        weightLb: 20,
        weightKg: 9.072,
        confidence: 0.92,
        needsReview: false,
      },
      {
        fieldName: "sebo",
        productId: 4,
        productName: "Sebo",
        weightLb: 50,
        weightKg: 22.68,
        confidence: 0.88,
        needsReview: false,
      },
      {
        fieldName: "hueso",
        productId: 5,
        productName: "Hueso",
        weightLb: 70,
        weightKg: 31.751,
        confidence: 0.87,
        needsReview: false,
      },
    ],
    totalWeightCheck: { passed: true, formTotalLb: 140, sumLb: 140 },
    needsReview: false,
    reviewReasons: [],
    ...overrides,
  };
}

// ── helpers ─────────────────────────────────────────────────────────────────

const extractMock = vi.mocked(formExtractionService.extractFromImage);
const analyzeMock = vi.mocked(analyzeScanImageCrop);
const createMock = vi.mocked(purchaseService.createWithDetails);

let objectUrlCounter = 0;

async function flush(ms = 0) {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });
}

async function selectFile() {
  const input = document.querySelector(
    'input[type="file"]',
  ) as HTMLInputElement;
  const file = new File(["img"], "form.jpg", { type: "image/jpeg" });
  fireEvent.change(input, { target: { files: [file] } });
  await flush(0); // resuelve analyzeScanImageCrop
  return file;
}

/** Sube una foto y presiona "Procesar" hasta que el flujo termina. */
async function processImage() {
  await selectFile();
  fireEvent.click(screen.getByRole("button", { name: "Procesar" }));
  // rAF + extracción + espera mínima del spinner (700 ms)
  await flush(1000);
}

beforeEach(() => {
  vi.useFakeTimers();
  objectUrlCounter = 0;
  URL.createObjectURL = vi.fn(() => `blob:mock-${++objectUrlCounter}`);
  URL.revokeObjectURL = vi.fn();
  globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) =>
    setTimeout(() => cb(0), 0)) as typeof requestAnimationFrame;
  analyzeMock.mockResolvedValue(NO_CROP);
});

afterEach(() => {
  vi.useRealTimers();
});

// ── tests ───────────────────────────────────────────────────────────────────

describe("ScanPurchase", () => {
  // F1
  it("muestra preview y sugerencia de recorte al seleccionar archivo", async () => {
    analyzeMock.mockResolvedValue(CROP_SUGGESTION);
    render(<ScanPurchase />);

    await selectFile();

    expect(screen.getByAltText("Vista previa del formulario")).toHaveAttribute(
      "src",
      "blob:mock-1",
    );
    // El recorte sugerido abre el editor con sus sliders
    expect(screen.getByLabelText(/arriba/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /quitar recorte/i }),
    ).toBeInTheDocument();
    expect(analyzeMock).toHaveBeenCalledOnce();
  });

  // F2
  it("pasa por processing con spinner y llega a review con los detalles", async () => {
    analyzeMock.mockResolvedValue(CROP_SUGGESTION);
    extractMock.mockResolvedValue(baseResult());
    render(<ScanPurchase />);

    await selectFile();
    fireEvent.click(screen.getByRole("button", { name: "Procesar" }));
    expect(
      screen.getByText(/extrayendo información del formulario/i),
    ).toBeInTheDocument();

    await flush(1000);

    expect(screen.getByText("Resultado del escaneo")).toBeInTheDocument();
    expect(screen.getByText("Valores detectados")).toBeInTheDocument();
    expect(screen.getAllByTestId("detail-row")).toHaveLength(3);
    expect(screen.getByTestId("row-product-0")).toHaveTextContent("Pieles");
    expect(screen.getByLabelText(/fecha/i)).toHaveValue("2026-06-11");
    // El proveedor con match directo llega precargado en las filas
    expect(screen.getByTestId("row-person-0")).toHaveTextContent("Juan José");
    // El recorte visible viaja al servicio de extracción
    expect(extractMock).toHaveBeenCalledWith(
      expect.any(File),
      expect.objectContaining({ crop: CROP_SUGGESTION.crop }),
    );
  });

  // F3
  it("muestra chips del top-3 cuando el proveedor es dudoso y aplica a todas las filas", async () => {
    extractMock.mockResolvedValue(
      baseResult({
        supplier: {
          rawName: "Juan Jose",
          confidence: 0.7,
          needsReview: true,
          candidates: [
            { id: 12, name: "Juan José Gómez", score: 0.7 },
            { id: 7, name: "Juan Pérez", score: 0.5 },
            { id: 21, name: "José Juárez", score: 0.41 },
          ],
        },
        needsReview: true,
        reviewReasons: ["Proveedor no identificado con confianza"],
      }),
    );
    render(<ScanPurchase />);

    await processImage();

    expect(screen.getByText("Proveedor por confirmar")).toBeInTheDocument();
    // Sin match confiable la celda de proveedor queda vacía (selección consciente)
    expect(screen.getByTestId("row-person-0").textContent).toBe("");

    fireEvent.click(screen.getByRole("button", { name: "Juan José Gómez" }));

    for (let i = 0; i < 3; i++) {
      expect(screen.getByTestId(`row-person-${i}`)).toHaveTextContent(
        "Juan José Gómez",
      );
    }
  });

  // F4
  it("con respuesta sin detalles muestra la alerta de sin valores y no permite guardar", async () => {
    extractMock.mockResolvedValue(
      baseResult({
        details: [],
        needsReview: true,
        reviewReasons: ["No se detectaron valores de productos"],
      }),
    );
    render(<ScanPurchase />);

    await processImage();

    expect(screen.getByText("Sin valores")).toBeInTheDocument();
    expect(
      screen.getByText("Imagen procesada, sin valores para guardar"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /guardar compra/i }),
    ).not.toBeInTheDocument();
    expect(ToastService.warning).toHaveBeenCalledWith(
      "Imagen procesada, pero no encontré valores en el formulario",
      undefined,
    );
  });

  // F5
  it("bloquea el guardado con fila incompleta y no llama al API", async () => {
    extractMock.mockResolvedValue(
      baseResult({
        details: [
          {
            fieldName: "pieles",
            // sin productId: la fila queda con productId 0 → incompleta
            productName: "Pieles",
            weightLb: 20,
            weightKg: 9.072,
            confidence: 0.92,
            needsReview: true,
          },
        ],
      }),
    );
    render(<ScanPurchase />);

    await processImage();
    fireEvent.click(screen.getByRole("button", { name: /guardar compra/i }));
    await flush(0);

    expect(ToastService.error).toHaveBeenCalledWith(
      expect.stringContaining("Cada fila debe tener producto"),
      undefined,
    );
    expect(createMock).not.toHaveBeenCalled();
  });

  // F6
  it("guarda una compra válida vía with-details y navega a /compras", async () => {
    extractMock.mockResolvedValue(baseResult());
    createMock.mockResolvedValue(baseResult() as never);
    render(<ScanPurchase />);

    await processImage();
    fireEvent.click(screen.getByRole("button", { name: /guardar compra/i }));
    await flush(0);

    expect(createMock).toHaveBeenCalledOnce();
    const payload = createMock.mock.calls[0][0];
    expect(payload.date).toBe("2026-06-11");
    expect(payload.purchase_details).toHaveLength(3);
    expect(payload.purchase_details?.[0]).toMatchObject({
      productId: 3,
      personId: 12,
      weight_kg: 9.072,
    });
    expect(ToastService.success).toHaveBeenCalledWith(
      "Compra creada exitosamente",
      undefined,
    );
    expect(mockNavigate).toHaveBeenCalledWith("/compras");
  });

  // F7
  it("con error del API vuelve a upload mostrando el mensaje del backend", async () => {
    const backendMessage =
      "El servicio de lectura del formulario tardó demasiado. Intenta de nuevo.";
    extractMock.mockRejectedValue(
      Object.assign(new Error("Request failed with status code 408"), {
        isAxiosError: true,
        response: {
          status: 408,
          data: { error: { message: backendMessage } },
        },
      }),
    );
    render(<ScanPurchase />);

    await processImage();

    expect(
      screen.getByText("No se pudo procesar la imagen"),
    ).toBeInTheDocument();
    expect(screen.getByText(backendMessage)).toBeInTheDocument();
    expect(ToastService.error).toHaveBeenCalledWith(backendMessage, undefined);
    // De vuelta en upload: el botón Procesar sigue disponible
    expect(
      screen.getByRole("button", { name: "Procesar" }),
    ).toBeInTheDocument();
  });

  // F8
  it("al agotar el timeout de UI vuelve a upload y aborta la petición", async () => {
    extractMock.mockReturnValue(new Promise(() => {})); // nunca resuelve
    render(<ScanPurchase />);

    await selectFile();
    fireEvent.click(screen.getByRole("button", { name: "Procesar" }));
    await flush(EXTRACTION_UI_TIMEOUT_MS + 1000);

    expect(
      screen.getByText("El procesamiento no terminó a tiempo"),
    ).toBeInTheDocument();
    expect(ToastService.error).toHaveBeenCalledWith(
      expect.stringContaining("está tardando demasiado"),
      undefined,
    );
    expect(
      screen.getByRole("button", { name: "Procesar" }),
    ).toBeInTheDocument();
    // La petición HTTP en vuelo quedó abortada (no sigue consumiendo cuota)
    const options = extractMock.mock.calls[0][1];
    expect(options?.signal?.aborted).toBe(true);
  });

  // F9
  it("lista las razones de revisión filtrando la de sin valores", async () => {
    extractMock.mockResolvedValue(
      baseResult({
        needsReview: true,
        reviewReasons: [
          "Total de libras no coincide: formulario=50, suma=140.00",
          "No se detectaron valores de productos",
        ],
      }),
    );
    render(<ScanPurchase />);

    await processImage();

    expect(screen.getByText("Revisa los datos detectados")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Total de libras no coincide: formulario=50, suma=140.00",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("No se detectaron valores de productos"),
    ).not.toBeInTheDocument();
  });

  // F10
  it("sin fecha detectada precarga hoy (Bogotá) y muestra la razón de revisión", async () => {
    extractMock.mockResolvedValue(
      baseResult({
        date: { value: null, confidence: 0, needsReview: true },
        needsReview: true,
        reviewReasons: ["Fecha no reconocida o ilegible"],
      }),
    );
    render(<ScanPurchase />);

    await processImage();

    expect(screen.getByLabelText(/fecha/i)).toHaveValue(todayBogota());
    expect(
      screen.getByText("Fecha no reconocida o ilegible"),
    ).toBeInTheDocument();
  });

  // F11
  it("«Escanear otra» limpia el estado y revoca los object URLs", async () => {
    extractMock.mockResolvedValue(baseResult());
    render(<ScanPurchase />);

    await processImage();
    fireEvent.click(screen.getByRole("button", { name: /escanear otra/i }));

    expect(
      screen.getByRole("button", { name: /tomar o subir foto/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Procesar" })).toBeDisabled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-1");
    expect(screen.queryByTestId("details-table")).not.toBeInTheDocument();
  });

  // F11 (variante «Ajustar imagen»)
  it("«Ajustar imagen» vuelve a upload conservando la foto y abre el editor de recorte", async () => {
    analyzeMock.mockResolvedValue(CROP_SUGGESTION);
    extractMock.mockResolvedValue(baseResult());
    render(<ScanPurchase />);

    await processImage();
    fireEvent.click(screen.getByRole("button", { name: /ajustar imagen/i }));

    expect(
      screen.getByAltText("Vista previa del formulario"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/arriba/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Procesar" })).not.toBeDisabled();
  });

  // F12
  it("los sliders actualizan el recorte y «Quitar recorte» lo resetea", async () => {
    analyzeMock.mockResolvedValue(CROP_SUGGESTION);
    render(<ScanPurchase />);

    await selectFile();

    const slider = screen.getByLabelText(/arriba/i);
    expect(slider).toHaveValue("5"); // 0.05 sugerido
    fireEvent.change(slider, { target: { value: "30" } });
    expect(screen.getByText("30%")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /quitar recorte/i }));

    expect(screen.queryByLabelText(/arriba/i)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /quitar recorte/i }),
    ).not.toBeInTheDocument();
  });
});

// La UI es el último escalón: si se rindiera antes que el cliente HTTP, abortaría
// —y pagaría— una cadena de modelos que todavía podía responder.
describe("escalera de timeouts", () => {
  it("la UI espera más que la petición HTTP", () => {
    expect(EXTRACTION_UI_TIMEOUT_MS).toBeGreaterThan(
      EXTRACTION_HTTP_TIMEOUT_MS,
    );
  });
});
