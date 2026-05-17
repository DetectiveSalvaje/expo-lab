import { ImageResponse } from "next/og";

// Icono principal: usado para favicon, manifest, install icon en Android
export const size = {
  width: 512,
  height: 512,
};

export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 360,
          fontWeight: 900,
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
          letterSpacing: "-0.02em",
          // Bajamos un poquito la E porque visualmente queda más centrada
          // (las letras sans-serif tienen un poco de espacio arriba)
          paddingBottom: 20,
        }}
      >
        E
      </div>
    ),
    { ...size },
  );
}
