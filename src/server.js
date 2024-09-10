import express from 'express';
import { MongoClient, ServerApiVersion } from 'mongodb';
import cors from 'cors'; // Importa o pacote cors

// Configurações do MongoDB
const uri = "mongodb+srv://kgz142:kgzMongoDBpass=40028922@kgzcluster.clu7w.mongodb.net/?retryWrites=true&w=majority&appName=kgzCluster";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Nome do banco de dados e da coleção
const dbName = 'chatbot';
const collectionName = 'conversas';

// Configura o servidor Express
const app = express();
const port = 3000;

// Middleware para parsing de JSON
app.use(express.json());

// Configura o middleware CORS
app.use(cors()); // Permite requisições de qualquer origem

// Ou, para permitir apenas origens específicas:
// app.use(cors({
//   origin: 'http://localhost:5173' // Substitua pelo seu domínio de front-end
// }));

// Função para conectar ao MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log('Conectado ao MongoDB Atlas com sucesso!');
  } catch (error) {
    console.error('Erro ao conectar com MongoDB Atlas:', error);
    process.exit(1); // Encerra o processo com código de erro
  }
}

// Endpoint para adicionar uma conversa
app.post('/api/conversas', async (req, res) => {
  const { usuario, mensagem, resposta } = req.body;

  if (!usuario || !mensagem || !resposta) {
    return res.status(400).send('Usuário, mensagem e resposta são obrigatórios');
  }

  const db = client.db(dbName);
  const collection = db.collection(collectionName);

  try {
    const resultado = await collection.insertOne({ usuario, mensagem, resposta, timestamp: new Date() });
    res.status(201).send(`Conversa registrada com o ID: ${resultado.insertedId}`);
  } catch (error) {
    console.error('Erro ao registrar conversa:', error);
    res.status(500).send('Erro ao registrar conversa');
  }
});

// Iniciar o servidor e conectar ao MongoDB
connectToMongo().then(() => {
  app.listen(port, () => {
    console.log(`Servidor ouvindo na porta ${port}`);
  });
});

// Fechar a conexão quando o processo for encerrado
process.on('SIGINT', async () => {
  await client.close();
  process.exit();
});
