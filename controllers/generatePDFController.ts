import puppeteer from "puppeteer";
import { NextFunction, Response } from 'express';
import { CustomRequest } from '../middleware/authenticatedUsersOnly';
import fs from "fs";
import path from "path";
import { v4 } from "uuid";

export const generatePDF = async (
    req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
    try {
      const { htmlContent } = req.body;
    //   const it = `
    //         <html>
    //             <body>
    //                 ${htmlContent}
    //             </body>
    //         </html>
    //   `

    const fileName = v4() + '.pdf';

      console.log("htmlContent", htmlContent);
      // const browser = await puppeteer.launch();
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf();
      await browser.close();

      const publicFolderPath = path.join(__dirname, '../public');
      const pdfFilePath = path.join(publicFolderPath, fileName);

      fs.writeFileSync(pdfFilePath, pdfBuffer);
  
      res.send({
        fileName
      });
  
    } catch (error) {
      next(error);
    }
  }