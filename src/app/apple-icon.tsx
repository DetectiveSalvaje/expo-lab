import { ImageResponse } from "next/og";

// Apple Touch Icon: iOS lo usa para el "Agregar a Pantalla de Inicio"
// y para el preview cuando se comparte la URL en iMessage, Mail, etc.
export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0e0e0e",
          color: "#f4f4f3",
          fontSize: 130,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: "-0.02em",
          paddingBottom: 8,
        }}
      >
        E
      </div>
    ),
    { ...size },
  );
}
