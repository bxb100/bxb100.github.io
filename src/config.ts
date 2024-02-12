import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://blog.tomcat.run/", // replace this with your deployed domain
  author: "John",
  desc: "John's Blog.",
  title: "Waaagh!",
  ogImage: "https://cdn.jsdelivr.net/gh/bxb100/bxb100@master/png2.png",
  lightAndDarkMode: true,
  postPerPage: 6,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/bxb100",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:john@tomcat.run",
    linkTitle: `Send an email to John`,
    active: true,
  },
];
