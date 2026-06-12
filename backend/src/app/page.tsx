export default function HomePage() {
  console.log(process.env.DATABASE_URL);
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem', textAlign: 'center' }}>
      <h1>Technical Council IITGN - API Backend</h1>
      <p>This is the server serving the API endpoints for the Technical Council website.</p>
    </div>
  );
}
