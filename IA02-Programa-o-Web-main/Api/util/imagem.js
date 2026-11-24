const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PASTA = path.join(__dirname, '..', 'uploads');
const TAMANHO_MAX = 5 * 1024 * 1024; // 5MB

// Aceita apenas .jpeg e .png (confere o tipo declarado E os bytes reais do arquivo)
const TIPOS = {
    'image/png': { ext: '.png', assinatura: Buffer.from([0x89, 0x50, 0x4e, 0x47]) },
    'image/jpeg': { ext: '.jpeg', assinatura: Buffer.from([0xff, 0xd8, 0xff]) },
};

// Recebe uma imagem em "data URL" (data:image/png;base64,....), valida e salva em /uploads.
// Retorna o nome do arquivo salvo. Lança Error com mensagem amigável se for inválida.
function salvarImagem(dataUrl) {
    const m = /^data:([\w/+.-]+);base64,(.+)$/s.exec(dataUrl || '');
    if (!m) throw new Error('Imagem inválida.');

    const tipo = TIPOS[m[1]];
    if (!tipo) throw new Error('Formato de imagem não permitido. Envie apenas .jpeg ou .png.');

    const buffer = Buffer.from(m[2], 'base64');
    if (buffer.length > TAMANHO_MAX) throw new Error('A imagem deve ter no máximo 5MB.');
    if (!buffer.subarray(0, tipo.assinatura.length).equals(tipo.assinatura)) {
        throw new Error('O arquivo enviado não é uma imagem .jpeg ou .png válida.');
    }

    fs.mkdirSync(PASTA, { recursive: true });
    const nome = crypto.randomUUID() + tipo.ext;
    fs.writeFileSync(path.join(PASTA, nome), buffer);
    return nome;
}

function removerImagem(nome) {
    if (!nome) return;
    // path.basename evita sair da pasta uploads
    fs.rm(path.join(PASTA, path.basename(nome)), { force: true }, () => {});
}

module.exports = { salvarImagem, removerImagem, PASTA };
