import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
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
          background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
          color: "#ffffff",
          fontSize: 18,
          fontWeight: 800,
          fontFamily: "Arial, sans-serif",
          borderRadius: 8,
        }}
      >
        W
      </div>
    ),
    size,
  );
}
