'use strict';

import fs from 'fs';
import path from 'path';
import mustache from 'mustache';
import cssesc from 'cssesc';
import { formatWords, isPathExist } from '../utils/util';
import _ from '../utils/underscore';

const tmplPathFn = (processor, templatePath) => {
  let tmplPath = `${__dirname}/${processor}.mustache`;
  if (!_.isUndefined(templatePath) && !_.isEmpty(templatePath) && _.isString(templatePath) && isPathExist(templatePath)) {
    tmplPath = templatePath;
  }

  return fs.readFileSync(tmplPath, 'utf8');
}

const cssTemplate = (params) => {
  // console.log('params: ', params)
  const cssItems = params.items;
  const anotherCssItems = params.sprites;
  const spritesheet = params.spritesheet;
  const imgX = spritesheet.width;
  const imgY = spritesheet.height;
  const options = params.options;
  const clsNamePrefix = options.cssClass;
  const wEnlarge = options.enlarge;
  let template = {
    items: null,
    enlarge: wEnlarge,
    imgUrl: null
  };
  let enlargedImgData = null;
  const spriteImgData = options.base64Data;
  const tImgName = options.imgName;
  const lastIndexDot = tImgName.lastIndexOf('.');
  const nameWithoutExt = tImgName.slice(0, lastIndexDot);
  const tImgNameEnlarged = nameWithoutExt + '@2x' + tImgName.slice(lastIndexDot);
  let tEnlargeX = null;
  let tEnlargeY = null;

  template.items = cssItems.map( (item) => {
    item.image = item.image.replace(/\\/g, '\/');
    item.escaped_image = item.escaped_image.replace(/\\/g, '\/');
    item.name = formatWords([clsNamePrefix, item.name], options.connector);
    item['class'] = '.' + cssesc(item.name, {isIdentifier: true});
    if (wEnlarge) {
      const insertIndex = item.escaped_image.lastIndexOf('.');

      if (options.reqBase64) {
        spriteImgData.forEach( (item) => {
          if (item.imgName.toLowerCase() === tImgNameEnlarged.toLowerCase()) {
            enlargedImgData = item.base64;
          }
        })
      }

      if (!options.reqBase64 && insertIndex > 0) {
        enlargedImgData = `${item.escaped_image.slice(0, insertIndex)}@${wEnlarge}x${item.escaped_image.slice(insertIndex)}`;
      }

      item['enlargedImage'] = enlargedImgData;
      item['enlargedX'] = Math.floor(imgX / wEnlarge);
      item['enlargedY'] = Math.floor(imgY / wEnlarge);
      item.px['enlargedX'] = item['enlargedX'] + 'px';
      item.px['enlargedY'] = item['enlargedY'] + 'px';

      tEnlargeX = item.px['enlargedX'];
      tEnlargeY = item.px['enlargedY'];

    }
    template.imgUrl = item.escaped_image;
    template.imgHdUrl = enlargedImgData;
    template.imgName = nameWithoutExt;
    template.nameClass = '.' + nameWithoutExt;
    template.enlargedX = tEnlargeX;
    template.enlargedY = tEnlargeY;
    return item;
  });

  const tmplFile = tmplPathFn(options.processor, options.templatePath);
  const css = mustache.render(tmplFile, template);
  return css;
}

module.exports = cssTemplate;
