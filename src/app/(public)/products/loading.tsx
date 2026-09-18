import "./products.css";

export default function Loading() {
  return (
    <div className="wrap products-loading">
      <div className="mh-top">
        <span className="skel-line" style={{ width: "180px" }} />
        <span className="skel-line" style={{ width: "230px", marginLeft: "auto" }} />
      </div>
      <span className="skel-line" style={{ width: "min(420px,80%)", height: "46px", marginTop: "1.4rem", display: "block" }} />
      <span className="skel-line" style={{ width: "min(540px,100%)", height: "56px", borderRadius: "999px", marginTop: "1.6rem", display: "block" }} />
      <div className="skel-rail">
        {[...Array(6)].map((_, i) => (
          <div className="skel-tile" key={i} />
        ))}
      </div>
      <div className="skel-chips">
        {[...Array(4)].map((_, i) => (
          <span className="skel-line" key={i} style={{ width: "112px", height: "44px", borderRadius: "999px" }} />
        ))}
      </div>
      <div className="cards-grid" style={{ marginTop: "1.5rem" }}>
        {[...Array(8)].map((_, i) => (
          <div className="skel-card" key={i} />
        ))}
      </div>
    </div>
  );
}