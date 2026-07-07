# Mostruário MLBB — Documentação do Projeto.

Sistema de dashboard e overlay para partidas customizadas de **Mobile Legends: Bang Bang (MLBB)**. Permite sortear modos de jogo aleatórios (cartas), exibir em overlay na stream, e gerenciar torneios com chaves de dupla eliminação.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Estrutura de Arquivos](#2-estrutura-de-arquivos)
3. [Firebase — Configuração e Nós](#3-firebase--configuração-e-nós)
4. [Dashboard Principal (`dashboard_completa_mobileV6.html`)](#4-dashboard-principal)
5. [Overlay / Showcase (`index+showcase.html`)](#5-overlay--showcase)
6. [Pasta `assets/` — Imagens das Cartas](#6-pasta-assets)
7. [Cartas Customizadas](#7-cartas-customizadas)
8. [Fluxo de Dados (Sincronização)](#8-fluxo-de-dados)
9. [Como Executar Localmente](#9-como-executar-localmente)

---

## 1. Visão Geral da Arquitetura

```
+---------------------------+       Firebase Realtime Database      +---------------------------+
|   Dashboard               |  <------ sincroniza em tempo real ---> |   Overlay / Showcase      |
|   (dashboard_completa_    |                                        |   (index+showcase.html)   |
|    mobileV6.html)         |                                        |                           |
|                           |  /showcase                             |   Exibido no OBS/Stream  |
|  - Seleção Manual         |  --- modo_id, imagem_url, status       |   - Roleta animada       |
|  - Roleta de Modos        |  /roleta_command                       |   - Revelação da carta   |
|  - Draft (Torneio)        |  --- targetId, timestamp               |   - Efeitos (confete,    |
|  - Criar Cartas           |  /roleta_config/active_modes           |     brilho, blur)        |
|                           |  --- ids dos modos ativos              |                           |
|                           |  /custom_cards/                        |                           |
|                           |  --- cartas criadas pelo usuário       |                           |
|                           |  /bracket_data                         |                           |
|                           |  --- estado do torneio                 |                           |
+---------------------------+                                        +---------------------------+
         |                                                                    |
         v                                                                    v
   Usuário controla                                                   Espectador vê na stream
```

**Conceito:** A dashboard funciona como **controle remoto**. Toda ação (selecionar carta, girar roleta, sortear time) é enviada ao Firebase. O overlay reage instantaneamente às mudanças, exibindo animações na stream.

---

## 2. Estrutura de Arquivos

```
mostruario-mlbb_antigravity/
│
├── .vscode/
│   └── settings.json              # Configuração do VS Code (Live Server porta 5501)
│
├── assets/                        # 22 imagens JPEG (arte das cartas)
│   ├── APENAS_UNICO(A)-apenas-magos.jpeg
│   ├── APENAS_UNICO(A)-apenas-suporte.jpeg
│   ├── APENAS_UNICO(A)-classe_atirador.jpeg
│   ├── APENAS_UNICO(A)-classe_mago.jpeg
│   ├── APENAS_UNICO(A)-classe_tank.jpeg
│   ├── APENAS_UNICO(A)-lane_mid.jpeg
│   ├── APENAS_UNICO(A)-lane_ouro.jpeg
│   ├── APENAS_UNICO(A)-lane_xp.jpeg
│   ├── CARTA_DO_ROBO-substituido_por_boot.jpeg
│   ├── deixa_que_eu_escolho.jpeg
│   ├── DEIXA_QUE_EU_ESCOLHO-impostor.jpeg
│   ├── EU_PROIBO-comunicacao.jpeg
│   ├── EU_PROIBO-feito-flash.jpeg
│   ├── EU_PROIBO-feitico-executar.jpeg
│   ├── EU_PROIBO-feitico-petrificar.jpeg
│   ├── EU_PROIBO-feitico-smite.jpeg
│   ├── EU_PROIBO-lane_mid_bloqueada.jpeg
│   ├── EU_PROIBO-lane_ouro.jpeg
│   ├── EU_PROIBO-lane_xp.jpeg
│   ├── EU_PROIBO-lord.jpeg
│   ├── EU_PROIBO-suportes_banidos.jpeg
│   └── EU_PROIBO-tanks_banidos.jpeg
│
├── firebase-config.js             # Inicialização do Firebase SDK (compartilhado)
├── dashboard_completa_mobileV6.html  # Dashboard principal (controle)
├── index+showcase.html            # Página de overlay para OBS/stream
├── INSTRUCOES_CARTAS.md           # Instruções para adicionar novas cartas
├── DOCUMENTACAO.md                # Esta documentação
│
├── .git/                          # Repositório Git (não documentado)
└── trash/                         # Versões anteriores (não documentado)
```

---

## 3. Firebase — Configuração e Nós

### Configuração (`firebase-config.js`)

Arquivo compartilhado entre dashboard e overlay. Importa o Firebase v10.7.1 via CDN da Google (`www.gstatic.com`) e inicializa o app com as credenciais do projeto **mlbb-showcasezlc**.

```js
// Exportações disponíveis:
import { db, ref, set, onValue } from './firebase-config.js';
```

| Função | Uso |
|---|---|
| `db` | Referência ao Realtime Database |
| `ref(db, 'caminho')` | Cria referência a um nó |
| `set(ref, valor)` | Salva dados no nó |
| `onValue(ref, callback)` | Escuta mudanças em tempo real |

### Nós do Realtime Database

| Nó | Formato | Descrição |
|---|---|---|
| `/showcase` | `{ modo_id, modo_atual, imagem_url, status_exibicao }` | Carta atualmente exibida no overlay |
| `/roleta_command` | `{ command, targetId, timestamp }` | Comando para iniciar giro da roleta no overlay |
| `/roleta_config/active_modes` | `[ "id1", "id2", ... ]` | Lista de IDs dos modos ativos na roleta |
| `/custom_cards/{id}` | `{ id, nome, cat, color, img, icon }` | Cartas customizadas criadas pelo usuário |
| `/bracket_data` | `{ state: matchData, timestamp }` | Estado atual do torneio (chaves) |

### Regras de Segurança (sugestão)

O banco está configurado com regras abertas para leitura/escrita. Para produção, recomenda-se restringir.

---

## 4. Dashboard Principal

**Arquivo:** `dashboard_completa_mobileV6.html`

Single-page application com **4 abas** e uma **sidebar** fixa (que vira barra inferior no celular).

### Sidebar

| Elemento | Função |
|---|---|
| **MLBB ADMIN** | Logo / identidade visual |
| Botão **Manual** | Abre a aba de seleção manual de cartas |
| Botão **Roleta** | Abre a roleta aleatória de modos |
| Botão **Draft** | Abre o sistema de torneio |
| Botão **Nova Carta** | Abre o formulário de criação de cartas |
| **Esconder** | Oculta o overlay (envia `status_exibicao: 'oculto'` ao Firebase) |
| **Status Pill** | Indicador no topo: "Overlay Visível" ou "Overlay Oculto" |

### Aba 1: Manual (Seleção Manual)

- Exibe todas as cartas organizadas por categoria em um grid.
- **Categorias:** Especiais, Classes, Lanes, Proibições, Custom.
- Cada carta é um botão. Ao clicar:
  - Envia os dados da carta ao Firebase (`/showcase`).
  - O overlay imediatamente exibe a carta na stream.
- Cartas customizadas (prefixo `custom_`) têm um botão de lixeira para exclusão.

### Aba 2: Roleta (Roleta Sincronizada)

- **Canvas** desenhado via JavaScript com fatias proporcionais aos modos ativos.
- **Checkboxes** à direita: ativa/desativa quais modos aparecem na roleta.
- **Botão "Girar Roleta":**
  - Sorteia um modo aleatório.
  - Anima a roleta (CSS `transform: rotate()` com easing).
  - Envia o resultado ao Firebase (`/roleta_command` + `/showcase`).

### Aba 3: Draft (Sistema de Torneio)

Sistema de dupla eliminação com suporte a **4, 8 ou 16 equipes**.

#### Componentes

| Elemento | Função |
|---|---|
| **Roleta de Equipes** | Canvas com fatias coloridas para sortear times |
| **Input + Add** | Adiciona equipes à lista |
| **+ BYE** | Adiciona vaga "BYE" (passe direto) |
| **Reiniciar** | Mantém os times mas zera as chaves |
| **Apagar** | Remove todos os times e reseta o torneio |
| **Seletor de Tamanho** | 4, 8 ou 16 equipes (altera o bracket) |
| **Sortear Vaga** | Gira a roleta e aloca o time sorteado no próximo slot |
| **Auto** | Gira automaticamente a cada 1s até preencher todas as vagas |
| **Instant.** | Embaralha e distribui todos os times restantes de uma vez |

#### Chaves (Bracket)

- **Chave Superior (Vitória):** O vencedor avança, o perdedor cai para a chave inferior.
- **Chave Inferior (Derrota):** O vencedor continua, o perdedor é eliminado.
- **Grande Final:** Vencedor da chave superior vs. vencedor da chave inferior.

#### Controles da Árvore

| Controle | Função |
|---|---|
| **Zoom +** | Aumenta o zoom da árvore (máx 150%) |
| **Zoom -** | Diminui o zoom (mín 40%) |
| **Reset** | Volta ao zoom 100% e scrolla para o topo |
| **Arrasto (Pan)** | Clique e arraste para navegar pelo viewport |
| **Imprimir** | Abre a janela de impressão (estilos específicos para PDF) |

#### Como usar o Draft

1. Selecione o tamanho da chave (4, 8 ou 16).
2. Adicione as equipes pelo campo de texto.
3. (Opcional) Adicione BYEs para completar vagas.
4. Clique em **Sortear Vaga** para alocar times um a um, ou **Instant.** para sortear todos de uma vez.
5. Após todos os times sorteados, clique no vencedor de cada partida (slot verde) para avançar.
6. Use **Undo** (hover no vencedor) para desfazer um resultado.

### Aba 4: Nova Carta (Criar Carta Customizada)

Formulário para criar cartas sem precisar editar código:

| Campo | Descrição |
|---|---|
| **Nome da Carta** | Nome visível (ex: "Modo Espelho") |
| **Nome do Arquivo** | Nome do arquivo JPEG em `assets/` (ex: `CARTA_ESPELHO.jpeg`) |
| **Categoria** | Especiais, Classes, Lanes, Proibições ou Customizados |
| **Cor Base** | Cor usada no texto da roleta e destaques |

Ao salvar:
- A carta é enviada ao Firebase (`/custom_cards`).
- É ativada automaticamente na roleta.
- Aparece imediatamente na aba Manual.

### Persistência (Draft)

O estado do draft é salvo em **dois lugares**:

| Onde | O que | Por quê |
|---|---|---|
| `localStorage` | Times, chaves, contagem | Sobrevive a refresh da página |
| Firebase `/bracket_data` | Estado das chaves | Sincronização com outros dispositivos |

---

## 5. Overlay / Showcase

**Arquivo:** `index+showcase.html`

Página projetada para ser usada como **fonte de navegador no OBS Studio** (ou similar). Possui 367 linhas e exibe **apenas um estado por vez**:

### Estados

| Estado | Descrição |
|---|---|
| **Roleta** | Canvas com fatias coloridas girando. Aparece quando um giro é disparado. |
| **Carta Revelada** | A carta sorteada aparece com animação 3D + confete + brilho. |

### Animação de Revelação

1. Roleta gira por 2 segundos.
2. Após 1.6s de pausa, a roleta fade out com efeito blur.
3. A carta desliza com perspectiva 3D.
4. **Confete** explode do centro da carta.
5. Efeito **shimmer/brilho** percorre a carta a cada 3.5s.

### Listeners do Firebase

| Listener | Reação |
|---|---|
| `custom_cards` | Carrega cartas customizadas |
| `roleta_config/active_modes` | Atualiza fatias da roleta |
| `roleta_command` | Dispara animação de giro |
| `showcase` | Exibe/esconde carta manual |

### Nomes Abreviados

O overlay usa nomes mais curtos que a dashboard para caber nas fatias da roleta:

| Nome na Dashboard | Nome no Overlay |
|---|---|
| Sem Comunicação | No Mic |
| Substituto por Bot | Bot |
| Proibido Executar | No Execute |
| ... | ... |

---

## 6. Pasta assets

Contém **22 imagens JPEG** — a arte de cada carta. A correspondência é definida no campo `img` de cada objeto `modo` no JavaScript.

Para adicionar uma nova carta fisicamente:
1. Coloque a imagem JPEG na pasta `assets/`.
2. Crie a carta na dashboard (aba Nova Carta) informando o nome do arquivo.

### Convenção de Nomenclatura

```
CATEGORIA-DESCRIÇÃO.jpeg
```

Exemplos: `EU_PROIBO-feitiço-executar.jpeg`, `APENAS_UNICO(A)-apenas-magos.jpeg`

---

## 7. Cartas Customizadas

### Via Dashboard (recomendado)

A aba **Nova Carta** permite criar cartas sem editar código:
- Preencha nome, arquivo de imagem, categoria e cor.
- Ao salvar, a carta vai para o Firebase e aparece automaticamente em todas as abas.

### Via Código (hardcoded)

Edite o array `defaultModosData` nos arquivos:
- `dashboard_completa_mobileV6.html`
- `index+showcase.html`

Estrutura de cada carta:

```js
{
    id: 'identificador-unico',
    nome: 'Nome Visível',
    cat: 'Especiais',         // Categoria
    color: '#f87171',         // Cor no texto da roleta
    img: 'NOME_DO_ARQUIVO.jpeg',  // Arquivo em assets/
    icon: 'bot'               // Nome do ícone Lucide
}
```

### Exclusão

Cartas customizadas (prefixo `custom_`) têm botão de lixeira na aba Manual. A exclusão:
1. Remove o nó `/custom_cards/{id}` do Firebase.
2. Se a carta estava ativa na roleta, remove também de `/roleta_config/active_modes`.

---

## 8. Fluxo de Dados

### Cenário 1: Seleção Manual

```
Usuário clica "Capitão Escolhe" na aba Manual
  → dashboard enpara SET /showcase { modo_id, modo_atual, imagem_url, status: "visivel" }
  → overlay escuta onValue(/showcase) e exibe a carta
  → status pill na dashboard muda para "Overlay Visível"
```

### Cenário 2: Giro da Roleta

```
Usuário clica "Girar Roleta"
  → dashboard sorteia modo aleatório
  → dashboard anima roleta localmente (CSS rotate)
  → dashboard envia SET /roleta_command { command: "spin", targetId, timestamp }
  → overlay escuta onValue(/roleta_command) e anima a roleta + revela carta
  → dashboard envia SET /showcase com os dados do vencedor
```

### Cenário 3: Draft

```
Usuário adiciona equipes
  → salva em localStorage + atualiza UI
  → (não envia ao Firebase até sortear)

Usuário clica "Sortear Vaga"
  → sorteia time aleatório
  → aloca no próximo slot vazio do bracket
  → salva em localStorage
  → envia SET /bracket_data { state: matchData }

Usuário clica em um vencedor na árvore
  → atualiza matchData (avança vencedor, envia perdedor)
  → salva em localStorage
  → envia SET /bracket_data
  → verifica BYEs (recursivo)
```

---

## 9. Como Executar Localmente

### Pré-requisitos

- Node.js (para Live Server ou similar)
- VS Code (recomendado) com extensão **Live Server**

### Passos

1. Abra a pasta no VS Code:
   ```
   code C:\Users\desktop\mostruario-mlbb_antigravity
   ```

2. Abra o arquivo desejado com **Live Server** (Alt+L, Alt+O):
   - `dashboard_completa_mobileV6.html` → Dashboard de controle
   - `index+showcase.html` → Overlay para OBS

3. **Para usar no OBS:**
   - Adicione uma fonte **Navegador**
   - URL: `http://127.0.0.1:5501/index+showcase.html`
   - Dimensões: recomendado 1920x1080
   - Marque "Controlar áudio via OBS" se necessário

### Porta Padrão

O VS Code Live Server está configurado para usar a **porta 5501** (definido em `.vscode/settings.json`).

---

## Tecnologias Utilizadas

| Tecnologia | Versão | Uso |
|---|---|---|
| Firebase Realtime Database | v10.7.1 | Sincronização em tempo real |
| Lucide Icons | latest | Ícones SVG na dashboard |
| Google Fonts (Inter, Outfit) | - | Tipografia |
| HTML5 Canvas | - | Desenho das roletas |
| CSS3 Animations | - | Giro, fade, 3D, confete, shimmer |
| ES Modules | - | Import/export do Firebase |
| localStorage | - | Persistência local do draft |

---

> Documentação gerada em Junho de 2026.
