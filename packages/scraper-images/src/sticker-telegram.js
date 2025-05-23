import * as cheerio from 'cheerio';
import got from 'got';
import { StickerTelegramSchema } from '../types/index.js';
import { DEFAULT_HEADERS } from './constant.js';
export default async function stickerTelegram(query, page) {
    const data = await got(`https://combot.org/stickers?q=${encodeURI(query)}&page=${page || 1}`, {
        headers: {
            ...DEFAULT_HEADERS,
            'user-agent': 'PostmanRuntime/7.39.1' // prevent forbidden
        }
    }).text();
    const $ = cheerio.load(data);
    const results = [];
    $('body > div > main > div.page > div > div.stickers-catalogue > div.tab-content > div > div').each(function () {
        var _a;
        const title = (_a = $(this).find('.sticker-pack__title').text()) === null || _a === void 0 ? void 0 : _a.trim();
        const icon = $(this)
            .find('.sticker-pack__sticker > div.sticker-pack__sticker-inner > div.sticker-pack__sticker-img')
            .attr('data-src');
        const link = $(this)
            .find('.sticker-pack__header > a.sticker-pack__btn')
            .attr('href');
        const stickers = [];
        $(this)
            .find('.sticker-pack__list > div.sticker-pack__sticker')
            .each(function () {
            const sticker = $(this)
                .find('.sticker-pack__sticker-inner > div.sticker-pack__sticker-img')
                .attr('data-src');
            if (sticker)
                stickers.push(sticker);
        });
        results.push({
            title,
            icon,
            link,
            stickers
        });
    });
    return results.map((value) => StickerTelegramSchema.parse(value));
}
