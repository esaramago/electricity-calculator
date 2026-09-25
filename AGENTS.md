## O que tenho atualmente

No excel https://docs.google.com/spreadsheets/d/1cqT2N8eNw645HiK4SlMfTBe66o75r2l21sJO022egIs, tenho o seguinte:

- Na aba Consumos, tenho o registo de leituras de eletricidade.
- Na aba Preços, na célula E1, tenho o meu consumo médio mensal, calculado através dos valores da aba Consumos.
- Também na aba Preços, tenho propostas de preços de comercializadoras.

## O que eu quero fazer

Quero substituir o excel https://docs.google.com/spreadsheets/d/1cqT2N8eNw645HiK4SlMfTBe66o75r2l21sJO022egIs por uma aplicação web.

## Stack sugerida

- PNPM
- SvelteKit
- Pocketbase
- Docker
- WebAwesome
- Hospedado no Coolify

## Notas

- Sem tailwind!
- Usa o componente Grid.svelte sempre que possível para estruturar o layout
- Usa WebAwesome para os elementos sempre que possível.
- Não faças CSS.Eu faço o CSS que for necessário.
- O cycle_days não deve estar no settings. É um campo fixo
- power_kva deve estar nas proposals.
- 6.1. Protegida por login
- 6.2. Vários tipos de cálculo
