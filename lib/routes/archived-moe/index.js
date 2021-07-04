const cheerio = require('cheerio');
const got = require('@/utils/got');
const _ = require('lodash');

async function fetch(ctx) {
    let url = 'https://archived.moe/_/search';
    if (!_.isUndefined(ctx.params.keywords)) {
        url += `/text/${ctx.params.keywords}`;
    }
    if (!_.isUndefined(ctx.params.tnum)) {
        url += `/tnum/${ctx.params.tnum}`;
    }

    const response = await got({
        method: 'get',
        url: url,
    });
    const responseHtml = response.data;
    const $ = cheerio.load(responseHtml);

    const rssItems = [];

    $('article.post').each((i, ele) => {
        const subTree = cheerio.load(ele);
        rssItems.push({
            title: `4chan: ${subTree('.post_show_board').text()}${subTree('[data-function="quote"]').text()}`,
            author: subTree('.post_author').text(),
            link: subTree('[data-function="quote"]').attr('href'),
            description: subTree('.text').html(),
            pubDate: subTree('time').attr('datetime'),
        });
    });

    return (ctx.state.data = {
        // 这么写是不是有点啰嗦了，，
        title: `4chan search result: ` + `${(ctx.params.keywords && `Keyword: "${ctx.params.keywords}"`) || ''} ` + `${(ctx.params.tnum && `ThreadId: ${ctx.params.tnum}`) || ''}`,
        link: url,
        item: rssItems,
    });
}

module.exports = fetch;
