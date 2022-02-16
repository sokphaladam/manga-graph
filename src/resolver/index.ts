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
  return Object.keys(volumes).map((key: any) => {
    return {
      ...volumes[key],
      chapters: Object.keys(volumes[key].chapters).map((x) => {
        return volumes[key].chapters[x];
      }),
    };
  });
}

async function MangaList(
  _: any,
  { limit, offset }: { limit: number; offset: number },
  ctx: ContextType
) {
  const res: any = await getRequest({
    path: "manga/",
    query:
      "limit=" +
      limit +
      "&offset=" +
      offset +
      "&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive&contentRating[]=erotica",
  });

  return (res.data as any[]).map((item) => {
    return {
      ...item.attributes,
      id: item.id,
      tags: () => mapTags(item.attributes.tags),
    };
  });
}

async function MangaDetail(_: any, { id }: { id: string }, ctx: ContextType) {
  const manga = await getRequest({
    path: "manga/",
    query:
      "includes[]=cover_art&includes[]=author&order[volume]=desc&order[chapter]=desc",
    id,
  });

  const aggregate = await getRequest({
    path: "manga/",
    id: id + "/aggregate",
    query: "translatedLanguage[]=en",
  });

  return {
    ...manga.data.attributes,
    id: manga.data.id,
    tags: () => mapTags(manga.data.attributes.tags),
    volumes: () => mapVolumes(aggregate.volumes),
  };
}

async function MangaChapter(_: any, { id }: { id: string }, ctx: ContextType) {
  const { data } = await getRequest({ path: "chapter/", id, query: "" });
  const { chapter, baseUrl } = await getRequest({
    path: "at-home/server/",
    id,
    query: "",
  });

  return {
    id: data.id,
    chapter: data.attributes.chapter,
    count: data.attributes.pages,
    images: chapter.dataSaver.map((x: any) => {
      return `${baseUrl}/data-saver/${chapter.hash}/${x}`;
    }),
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
