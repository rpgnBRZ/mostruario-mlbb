# 🃏 Instruções - Como Adicionar Novas Cartas ao Mostruário MLBB

Este documento explica as **duas formas** de adicionar novas cartas (modos) ao seu sistema de showcase.

---

## 📁 Regra Geral: A Imagem (Arte) da Carta

Independente do método escolhido, a **imagem da carta** deve ser colocada manualmente na pasta `assets/` do projeto.

**Exemplo:** Se sua carta se chama "Modo Espelho" e a arte é `CARTA_ESPELHO.jpeg`, copie o arquivo para:
```
mostruario-mlbb_antigravity/
└── assets/
    └── CARTA_ESPELHO.jpeg   <-- coloque aqui
```

> ⚠️ **IMPORTANTE:** O nome do arquivo que você usar na hora de cadastrar a carta deve ser **exatamente igual** ao nome do arquivo na pasta `assets/`, incluindo maiúsculas, minúsculas e extensão (`.jpeg`, `.png`, etc.).

---

## ✅ Método 1: Pela Dashboard (Recomendado)

Este é o método mais fácil e rápido. Funciona em tempo real e sincroniza automaticamente com todos os overlays.

### Passo a passo:

1. Abra a **Dashboard** (`dashboard_completa_mobileV2.html`).
2. Clique na aba **"Nova Carta"** no menu lateral (ou no ícone `+` no mobile).
3. Preencha os campos:
   - **Nome da Carta:** O nome que aparecerá na roleta e nos botões (ex: `Modo Espelho`).
   - **Nome do Arquivo:** O nome exato da imagem na pasta `assets/` (ex: `CARTA_ESPELHO.jpeg`).
   - **Categoria:** Escolha onde a carta ficará agrupada (Especiais, Classes, Lanes, Proibições ou Customizados).
   - **Cor Base:** A cor que será usada na fatia da roleta e no texto. O padrão é dourado (`#d4af37`), mas você pode alterar.
4. Clique em **"Salvar Nova Carta"**.
5. Pronto! A carta já aparece automaticamente na aba "Manual", na "Roleta" e nos overlays (`index+showcase.html` e `roleta.html`).

### Como excluir uma carta criada pela Dashboard:

1. Vá para a aba **"Manual"**.
2. Encontre a carta customizada (ela terá um ícone de **lixeira** 🗑️ vermelho ao lado).
3. Clique na lixeira e confirme a exclusão.

### Onde os dados ficam salvos?

Os dados das cartas criadas por este método ficam salvos no **Firebase Realtime Database**, no caminho:
```
custom_cards/
├── custom_1234567890/
│   ├── id: "custom_1234567890"
│   ├── nome: "Modo Espelho"
│   ├── cat: "Custom"
│   ├── color: "#d4af37"
│   ├── img: "CARTA_ESPELHO.jpeg"
│   └── icon: "star"
```

---

## 🔧 Método 2: Direto no Código (Modo Antigo)

Este método é para quem quer que a carta fique **permanentemente registrada** no código-fonte, sem depender do Firebase para a definição da carta.

### Passo a passo:

Você precisa adicionar o objeto da carta em **3 arquivos**:

#### 1. `dashboard_completa_mobileV2.html`

Procure o array chamado `defaultModosData` (dentro da tag `<script>`) e adicione o novo objeto **antes do `];`** de fechamento do array:

```javascript
const defaultModosData = [
    // ... cartas existentes ...
    { id: 'sem-comunicacao', nome: 'Sem Comunicação', cat: 'Proibições', color: '#ef4444', img: 'EU_PROIBO-comunicação.jpeg', icon: 'mic-off' },
    // 👇 ADICIONE A NOVA CARTA AQUI
    { id: 'modo-espelho', nome: 'Modo Espelho', cat: 'Especiais', color: '#d4af37', img: 'CARTA_ESPELHO.jpeg', icon: 'star' }
];
```

#### 2. `index+showcase.html`

Procure o array chamado `defaultModosData` e adicione o mesmo objeto:

```javascript
const defaultModosData = [
    // ... cartas existentes ...
    { id: 'sem-comunicacao', nome: 'No Mic', color: '#ef4444', img: 'EU_PROIBO-comunicação.jpeg' },
    // 👇 ADICIONE A NOVA CARTA AQUI
    { id: 'modo-espelho', nome: 'Modo Espelho', color: '#d4af37', img: 'CARTA_ESPELHO.jpeg' }
];
```

> **Nota:** Neste arquivo, o campo `nome` costuma ser mais curto (abreviado) para caber na roleta do overlay.

#### 3. `roleta.html`

Procure o array chamado `defaultModosData` e adicione o mesmo objeto:

```javascript
const defaultModosData = [
    // ... cartas existentes ...
    { id: 'sem-comunicacao', nome: 'No Mic', color: '#ef4444', img: 'EU_PROIBO-comunicação.jpeg' },
    // 👇 ADICIONE A NOVA CARTA AQUI
    { id: 'modo-espelho', nome: 'Modo Espelho', color: '#d4af37', img: 'CARTA_ESPELHO.jpeg' }
];
```

### Campos do objeto da carta:

| Campo   | Obrigatório | Descrição                                                        | Exemplo                          |
|---------|:-----------:|------------------------------------------------------------------|----------------------------------|
| `id`    | ✅          | Identificador único (sem espaços, use hífens)                    | `'modo-espelho'`                 |
| `nome`  | ✅          | Nome exibido na roleta e nos botões                              | `'Modo Espelho'`                 |
| `cat`   | Dashboard   | Categoria (Especiais, Classes, Lanes, Proibições, Custom)        | `'Especiais'`                    |
| `color` | ✅          | Cor em hexadecimal para a roleta e textos                        | `'#d4af37'`                      |
| `img`   | ✅          | Nome do arquivo da arte na pasta `assets/`                       | `'CARTA_ESPELHO.jpeg'`           |
| `icon`  | Dashboard   | Ícone Lucide para o botão (ver https://lucide.dev/icons)         | `'star'`                         |

---

## 🎨 Cores Comuns para Referência

| Cor         | Hex       | Uso Comum       |
|-------------|-----------|-----------------|
| Vermelho    | `#ef4444` | Proibições       |
| Laranja     | `#fb923c` | Especiais        |
| Dourado     | `#d4af37` | Padrão / Custom  |
| Amarelo     | `#fbbf24` | Especiais        |
| Verde       | `#4ade80` | Classes          |
| Azul        | `#60a5fa` | Classes          |
| Roxo        | `#818cf8` | Classes          |
| Lilás       | `#c084fc` | Lanes            |
| Rosa        | `#f472b6` | Classes          |
| Cinza       | `#9ca3af` | Neutro           |
| Cinza Escuro| `#4b5563` | Bloqueios        |

---

## ❓ Perguntas Frequentes

**P: Se eu criar uma carta pela Dashboard, preciso editar o código?**
R: Não! A carta é salva no Firebase e sincronizada automaticamente com todos os overlays.

**P: E se eu criar pelo código, preciso colocar no Firebase?**
R: Não! As cartas do código já são carregadas automaticamente. As do Firebase são somadas a elas.

**P: Posso usar os dois métodos ao mesmo tempo?**
R: Sim! As cartas do código (hardcoded) e as do Firebase (custom) são combinadas numa lista única.

**P: Como ativo/desativo uma carta na roleta?**
R: Na aba "Roleta" da Dashboard, marque ou desmarque o checkbox da carta desejada.
