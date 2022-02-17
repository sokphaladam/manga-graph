import { ContextType } from "../lib/ContextType";
import GraphQLJSON, { GraphQLJSONObject } from "graphql-type-json";
import { getRequest } from "../service/request";

function mapTags(tags: any[]) {
  return tags.map((tag: any) => {
    return {
      id: tag.id,
      ...tag.attributes,
    };
  });
}

function mapVolumes(volumes: any[]) {
  return volumes.map((x) => {
    return {
      id: x.id,
      ...x.attributes,
      relationships: x.relationships,
    };
  });
}

async function MangaList(
  _: any,
  {
    limit,
    offset,
    pornographic,
  }: { limit: number; offset: number; pornographic: boolean },
  ctx: ContextType
) {
  const res: any = await getRequest({
    path: "manga/",
    query: `limit=${limit}&offset=${offset}&includes[]=cover_art${
      pornographic
        ? "&contentRating[]=pornographic"
        : "&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica"
    }`,
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

async function MangaDetail(
  _: any,
  { id, limit, offset }: { id: string; limit: number; offset: number },
  ctx: ContextType
) {
  const manga = await getRequest({
    path: "manga/",
    query:
      "includes[]=cover_art&includes[]=author&order[volume]=desc&order[chapter]=desc",
    id,
  });

  const feed = await getRequest({
    path: "manga/",
    id: id + "/feed",
    query: `limit=${limit}&includes[]=scanlation_group&includes[]=user&order[volume]=asc&order[chapter]=asc&offset=${offset}&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&translatedLanguage[]=en`,
  });

  const cover = manga.data.relationships.find(
    (f: any) => f.type === "cover_art"
  );

  return {
    ...manga.data.attributes,
    id: manga.data.id,
    relationships: manga.data.relationships,
    coverImage: `${ctx.upload}covers/${manga.data.id}/${cover.attributes.fileName}`,
    tags: () => mapTags(manga.data.attributes.tags),
    volumes: () => mapVolumes(feed.data),
    totalVolumes: feed.total,
  };
}

async function MangaChapter(_: any, { id }: { id: string }, ctx: ContextType) {
  const { data } = await getRequest({
    path: "chapter/",
    id,
    query: "includes[]=manga",
  });
  const { chapter, baseUrl } = await getRequest({
    path: "at-home/server/",
    id,
    query: "",
  });

  const manga = data.relationships.find((x: any) => x.type === "manga");
  const feed = await getRequest({
    path: "manga/",
    id: manga.id + "/feed",
    query: `includes[]=scanlation_group&includes[]=user&order[volume]=asc&order[chapter]=asc&offset=0&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica&contentRating[]=pornographic&translatedLanguage[]=en`,
  });
  const volumes = mapVolumes(feed.data).filter((x) => x.pages > 0);
  const next = volumes.findIndex((x) => x.id === id);

  return {
    id: data.id,
    ...data.attributes,
    images: chapter.dataSaver.map((x: any) => {
      return `${baseUrl}/data-saver/${chapter.hash}/${x}`;
    }),
    relationships: data.relationships,
    nextChapter: volumes[next + 1] ? volumes[next + 1].id : null,
  };
}

export const RESOLVER = {
  JSON: GraphQLJSON,
  JSONObject: GraphQLJSONObject,
  Query: {
    mangaList: MangaList,
    mangaDetail: MangaDetail,
    mangaChapter: MangaChapter,
  },
};
