#!/usr/bin/env node
const http = require('http');
const url = require('url');

const port = process.env.PORT || 8090;

// Mock dataset — adicione outras placas conforme necessário
const MOCK_DB = {
  'ABC1A23': { placa: 'ABC1A23', marca: 'FIAT', modelo: 'Uno', ano: 2016, cor: 'Prata', clienteNome: 'Pela' },
  'XYZ9999': { placa: 'XYZ9999', marca: 'VW', modelo: 'Gol', ano: 2018, cor: 'Preto', clienteNome: 'João' },
  'DEF2B45': { placa: 'DEF2B45', marca: 'HONDA', modelo: 'Civic', ano: 2020, cor: 'Branco', clienteNome: 'Maria' },
  'GHI3C67': { placa: 'GHI3C67', marca: 'TOYOTA', modelo: 'Corolla', ano: 2022, cor: 'Cinza', clienteNome: 'Carlos' },
  'JKL4D89': { placa: 'JKL4D89', marca: 'CHEVROLET', modelo: 'Onix', ano: 2021, cor: 'Vermelho', clienteNome: 'Ana' },
};

function normalizePlaca(raw) {
  if (!raw) return null;
  return String(raw).toUpperCase().replace(/[^A-Z0-9]/g, '') || null;
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode);
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      if (!body) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const parsed = url.parse(req.url, true);
  const path = parsed.pathname || '';
  const veiculoByPlacaMatch = path.match(/^\/api\/veiculos\/([^/]+)$/);

  if (path === '/api/veiculos' && req.method === 'GET') {
    const placa = normalizePlaca(parsed.query.placa);

    if (!placa) {
      sendJson(res, 200, Object.values(MOCK_DB));
      return;
    }

    const found = MOCK_DB[placa];
    if (!found) {
      sendJson(res, 404, { message: 'Veículo não encontrado' });
      return;
    }

    sendJson(res, 200, found);
    return;
  }

  if (path === '/api/veiculos' && req.method === 'POST') {
    readJsonBody(req)
      .then((body) => {
        const placa = normalizePlaca(body.placa);
        const marca = body.marca?.toString().trim();
        const modelo = body.modelo?.toString().trim();
        const ano = body.ano == null || body.ano === '' ? undefined : Number(body.ano);
        const cor = body.cor?.toString().trim() || undefined;
        const clienteNome = body.clienteNome?.toString().trim() || undefined;

        if (!placa || !marca || !modelo) {
          sendJson(res, 400, { message: 'Campos obrigatórios: placa, marca e modelo.' });
          return;
        }

        if (MOCK_DB[placa]) {
          sendJson(res, 409, { message: 'Já existe veículo com esta placa.' });
          return;
        }

        MOCK_DB[placa] = { placa, marca, modelo, ano, cor, clienteNome };
        sendJson(res, 201, MOCK_DB[placa]);
      })
      .catch(() => sendJson(res, 400, { message: 'JSON inválido.' }));
    return;
  }

  if (veiculoByPlacaMatch && req.method === 'PUT') {
    const placaPath = normalizePlaca(decodeURIComponent(veiculoByPlacaMatch[1]));
    if (!placaPath || !MOCK_DB[placaPath]) {
      sendJson(res, 404, { message: 'Veículo não encontrado' });
      return;
    }

    readJsonBody(req)
      .then((body) => {
        const atual = MOCK_DB[placaPath];
        const marca = body.marca?.toString().trim() || atual.marca;
        const modelo = body.modelo?.toString().trim() || atual.modelo;
        const ano = body.ano == null || body.ano === '' ? undefined : Number(body.ano);
        const cor = body.cor?.toString().trim() || undefined;
        const clienteNome = body.clienteNome?.toString().trim() || atual.clienteNome;

        MOCK_DB[placaPath] = {
          placa: placaPath,
          marca,
          modelo,
          ano,
          cor,
          clienteNome,
        };

        sendJson(res, 200, MOCK_DB[placaPath]);
      })
      .catch(() => sendJson(res, 400, { message: 'JSON inválido.' }));
    return;
  }

  if (veiculoByPlacaMatch && req.method === 'DELETE') {
    const placaPath = normalizePlaca(decodeURIComponent(veiculoByPlacaMatch[1]));
    if (!placaPath || !MOCK_DB[placaPath]) {
      sendJson(res, 404, { message: 'Veículo não encontrado' });
      return;
    }

    delete MOCK_DB[placaPath];
    res.writeHead(204);
    res.end();
    return;
  }

  sendJson(res, 404, { message: 'Rota não encontrada' });
});

server.listen(port, () => {
  console.log(`Mock backend (veículos) rodando em http://localhost:${port}`);
});
