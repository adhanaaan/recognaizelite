import Router from "next/router";
import NProgress from "nprogress";
import { isServer } from "src/constants";
import IMAGES from "src/constants/IMAGES.json";
import { preloadImages } from "src/lib/image-cache";

import { am } from "./audio-manager";

Router.events.on("routeChangeStart", NProgress.start);
Router.events.on("routeChangeComplete", NProgress.done);
Router.events.on("routeChangeError", NProgress.done);

if (!isServer) {
  preloadImages(IMAGES["play"], "/images/play");
  preloadImages(IMAGES["result"], "/images/result");

  am.load("click", "/sounds/click.mp3");
  am.load("correct", "/sounds/correct.mp3");
  am.load("wrong", "/sounds/wrong.mp3");

  am.load("symbol-matching", "/sounds/level_completed_1.mp3");
  am.load("trail-making", "/sounds/level_completed_2.mp3");
  am.load("airplane-game", "/sounds/level_completed_3.mp3");
  am.load("grocery-shopping", "/sounds/level_completed_4.mp3");
}
