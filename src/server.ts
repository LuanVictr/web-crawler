import express, { Request, Response } from 'express';
import crawlerRoute from './routes/route'

const app = express();
const port = 3000;

app.use(express.json());
app.use(crawlerRoute);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
