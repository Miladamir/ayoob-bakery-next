import "./categories.css";

export default function Loading() {
  return (
    <div className="wrap cats-loading">
      <span className="cat-skel" style={{ width: "180px" }} />
      <span className="cat-skel" style={{ width: "min(420px,80%)", height: "46px", marginTop: "1.4rem", display: "block" }} />
      <div className="acgrid" style={{ marginTop: "2.6rem" }}>
        {[0, 1, 2, 3].map((i) => (
          <div className={`cat-skel-card ${i % 2 === 0 ? "ac--a" : "ac--b"}`} key={i} />
        ))}
      </div>
    </div>
  );
}