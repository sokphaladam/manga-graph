import { ContextType } from "../../lib/ContextType";
import { getRequest } from "../../service/request";

interface Props {
    limit: number;
    offset: number;
		search: string;
}

function mapTags(tags: any[]) {
  return tags.map((tag: any) => {
    return {
      id: tag.id,
      ...tag.attributes,
    };
  });
}

export async function MangaList(_: any, {limit, offset, search}: Props, ctx: ContextType) {
	const lastUpdate = await getRequest({
		path: 'chapter/',
		query: `translatedLanguage[]=en&includes[]=manga&includes[]=scanlation_group&limit=24&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&order[readableAt]=desc`
	});


	const chapters = [];
	for(const ch of lastUpdate.data){
		const find = ch.relationships.find((f: any) => f.type === 'manga');
		if(find){
			chapters.push(find.id)
		}
	}

	const res: any = await getRequest({
			path: "manga/",
			query: `${search ? 'title='+search+'&' : ''}limit=${limit}&offset=${offset}&includes[]=cover_art&includes[]=author&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica${!search ? `&ids[]=${chapters.join('&ids[]=')}` : ''}`,
		});
	
	return (res.data as any[]).map((item) => {
		const cover = item.relationships.find((f: any) => f.type === "cover_art");
		return {
			...item.attributes,
			id: item.id,
			tags: () => mapTags(item.attributes.tags),
			relationships: item.relationships,
			coverImage: `${ctx.upload}covers/${item.id}/${cover.attributes.fileName}`,
		};
	});
}