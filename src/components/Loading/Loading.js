import React from 'react';
import './Loading.css'; // Asegúrate de crear este archivo CSS para los estilos

const Loading = () => {
  return (
    <section className="dots-container">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </section>
  );
};

export default Loading;