import puppeteer from "puppeteer";

export const crawlerService = async (id: string) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  const url = "https://pje-consulta-publica.tjmg.jus.br/";

  try {
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const title = await page.title();
    console.log("Título da página:", title);

    const inputSelector =
      "#fPP\\:numProcesso-inputNumeroProcessoDecoration\\:numProcesso-inputNumeroProcesso";
    const input = await page.waitForSelector(inputSelector);

    await page.locator(inputSelector).fill(id);
    console.log("ID do processo:", id);

    await page.waitForSelector("#fPP\\:searchProcessos");

    await page.click("#fPP\\:searchProcessos");

    console.log('Botão "Pesquisar" clicado!');

    const button = await page.waitForSelector(
      'a.btn.btn-default.btn-sm[title="Ver Detalhes"]'
    );

    await button?.click();

    const pageTarget = page.target();

    const newTarget = await browser.waitForTarget(
      (target) => target.opener() === pageTarget
    );
    
    const newPage = await newTarget.page();
    
    if (newPage) {
      await newPage.waitForSelector('div');
      const tables = await newPage.waitForSelector('#j_id134');
      await tables?.screenshot({
        path: "hn.png",
      });
    }

    const info = await newPage?.evaluate(() => {
      const generalInfo = document.querySelector('.rich-stglpanel-body#j_id134\\:processoTrfViewView\\:j_id137_body');
      const activeParts = document.querySelector('.rich-panel-body#j_id134\\:j_id266_body');

      if (!generalInfo) {
        throw new Error('generalInfo not found');
      }

      if (!activeParts) {
        throw new Error('generalInfo not found');
      }

      const numeroProcessoElement = generalInfo.querySelector('#j_id134\\:processoTrfViewView\\:j_id140 .value');
      const dataDistribuicaoElement = generalInfo.querySelector('#j_id134\\:processoTrfViewView\\:j_id152 .value');
      const classeJudicialElement = generalInfo.querySelector('#j_id134\\:processoTrfViewView\\:j_id163 .value');
      const assuntoElement = generalInfo.querySelector('#j_id134\\:processoTrfViewView\\:j_id174 .value');
      const jurisdiçãoElement = generalInfo.querySelector('#j_id134\\:processoTrfViewView\\:j_id187 .value');
      const orgaoJulgadorElement = generalInfo.querySelector('#j_id134\\:processoTrfViewView\\:j_id211 .value');
      const table = activeParts.querySelector('table.rich-table');

      const partesAtivas = [];

      if (table) {
        const rows = table.querySelectorAll('tbody > tr');
        rows.forEach((row:any) => {
          console.log('achou');
          const nomeParte = row.querySelector('.rich-table-cell:nth-child(1)').textContent.trim();
          const situacaoParte = row.querySelector('.rich-table-cell:nth-child(2)').textContent.trim();
          
          partesAtivas.push({ nomeParte, situacaoParte });
        });
      }

      if (!numeroProcessoElement || !dataDistribuicaoElement || !classeJudicialElement || !assuntoElement || !jurisdiçãoElement || !orgaoJulgadorElement) {
        throw new Error('One or more elements not found');
      }

      return {
        numeroProcesso: numeroProcessoElement?.textContent?.trim(),
        dataDistribuicao: dataDistribuicaoElement?.textContent?.trim(),
        classeJudicial: classeJudicialElement?.textContent?.trim(),
        assunto: assuntoElement?.textContent?.trim(),
        jurisdição: jurisdiçãoElement?.textContent?.trim(),
        orgaoJulgador: orgaoJulgadorElement?.textContent?.trim(),
      };
    });

    console.log('Informações extraídas:', info);
    
    const result = {
      numeroProcesso: info?.numeroProcesso,
        dataDistribuicao: info?.dataDistribuicao,
        classeJudicial: info?.classeJudicial,
        assunto: info?.assunto,
        jurisdição: info?.jurisdição,
        orgaoJulgador: info?.orgaoJulgador,
    }

    return result;
  } catch (error) {
    console.error("Erro ao executar o crawler:", error);
  } finally {
    await browser.close();
  }
};
