import "./search.css";

export default function Loading() {
  return (
    <div className="wrap search-loading">
      <div className="mh-top">
        <span className="skel-line" style={{ width: "160px" }} />
        <span className="skel-line" style={{ width: "220px", marginLeft: "auto" }} />
      </div>
      <span className="skel-line" style={{ width: "min(380px,80%)", height: "44px", marginTop: "1.4rem", display: "block" }} />
      <span className="skel-bar" />
      <div className="cards-grid" style={{ marginTop: "2.8rem" }}>
        {[...Array(8)].map((_, i) => (
          <div className="skel-card" key={i} />
        ))}
      </div>
    </div>
  );
}