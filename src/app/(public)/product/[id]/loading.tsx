import "./product.css";

export default function Loading() {
  return (
    <div className="wrap pd-loading">
      <span className="skel-line" style={{ width: "min(420px,80%)" }} />
      <div className="pd-grid" style={{ marginTop: "1.6rem" }}>
        <div className="pd-skel-stage" />
        <div className="pd-skel-info">
          <span className="skel-line" style={{ width: "35%", height: "18px" }} />
          <span className="skel-line" style={{ width: "80%", height: "52px", marginTop: "1rem" }} />
          <span className="skel-line" style={{ width: "60%", height: "14px", marginTop: "1rem" }} />
          <span className="skel-line" style={{ width: "45%", height: "34px", marginTop: "1.6rem" }} />
          <span className="skel-line" style={{ width: "100%", height: "58px", borderRadius: "999px", marginTop: "1.8rem" }} />
        </div>
      </div>
    </div>
  );
}