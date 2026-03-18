"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, background: "#f6f6f6", fontFamily: "Montserrat, Arial, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ background: "white", borderRadius: "2px", padding: "3rem", maxWidth: "28rem", width: "100%", textAlign: "center", boxShadow: "0 4px 12px rgba(23,48,69,0.06)" }}>
            <div style={{ width: "56px", height: "56px", margin: "0 auto 1.5rem", background: "#FEF2F2", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: "24px" }}>!</span>
            </div>
            <h2 style={{ color: "#173045", fontSize: "18px", fontWeight: 800, margin: "0 0 0.5rem" }}>
              Etwas ist schiefgelaufen
            </h2>
            <p style={{ color: "#414142", opacity: 0.5, fontSize: "13px", margin: "0 0 1.5rem" }}>
              Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.
            </p>
            <button
              onClick={reset}
              style={{ background: "#FCB923", color: "#173045", border: "none", padding: "12px 32px", borderRadius: "2px", fontSize: "13px", fontWeight: 700, cursor: "pointer", letterSpacing: "0.5px" }}
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}