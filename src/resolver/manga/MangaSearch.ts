import { ContextType } from "../../lib/ContextType";
import { getRequest } from "../../service/request";

export async function MangaSearch(_: any, {search}: any, ctx: ContextType){
    const author = await getRequest({
        path: 'author/',
        query: `name=${search}&limit=5`
    });

    const manga = await getRequest({
        path: 'manga/',
        query: `title=${search}&limit=5&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&includes[]=cover_art&order[relevance]=desc`
    });

    return {
        author: author.data,
        manga: manga.data
    }
}