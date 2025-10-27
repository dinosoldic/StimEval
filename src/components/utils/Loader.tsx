import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader">
      <div className="loader-container">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="loader-container-box" />
        ))}
      </div>
    </div>
  );
};

export default Loader;
