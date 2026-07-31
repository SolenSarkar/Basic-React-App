import React from 'react';
import ItemList from './components/ItemList';

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>📦 MERN App</h1>
        <p>React Frontend + Express + MongoDB Atlas</p>
      </header>
      <main>
        <ItemList />
      </main>
    </div>
  );
}

export default App;

