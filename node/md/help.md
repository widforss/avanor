**NB! Currently, Avanor only have coverage for Scandinavia. If you need coverage over another area, please request it via email ([info@avanor.se](mailto:info@avanor.se)). This is a pre-release version of Avanor, and it may or may not work as expected.**

Avanor is an avalanche observation tool. It uses [Sentinel&#8209;1](https://sentinel.esa.int/web/sentinel/missions/sentinel-1) [SAR](https://en.wikipedia.org/wiki/Synthetic-aperture_radar) [GRD](https://sentinel.esa.int/web/sentinel/technical-guides/sentinel-1-sar/products-algorithms/level-1-algorithms/ground-range-detected) data to find changes in reflectance on the ground. Due to the relatively large temporal resolution of the data (6&nbsp;or&nbsp;12&nbsp;days), some avalanches may not be seen due to ground blizzards and other meteorological phenomena that may cover the avalanche with snow. Due to the large spatial resolution (10&nbsp;m), small avalanches may be hard to spot as well. **It is unknown what percentage of avalanches may be observed using Avanor. No study have been performed to validate that Avanor works correctly.**

## Understanding the map

![Avalanche](/static/media/help/avalanche.png)

### <svg viewBox="-1 -1 2 2"><circle r="1" fill="red"/></svg> Detected changes and avalanches

All Avanor images have a timespan of 6&nbsp;or&nbsp;12 days. The changes are shown in red on the map, and while there will be some noise (weak red spots scattered over the map), detected avalanches are easily recognized as red stripes or areas. Due to the large temporal resolution the same avalanche may end up on multiple days worth of images. To more exactly get the date of an avalanche one can step back one day at a time and find the first image that shows that specific avalanche.

### <svg viewBox="-1 -1 2 2"><circle r="1" fill="#7570b3"/></svg> Avalanche terrain

Most avalanches start in terrain that is between 30&#8209;40°. These areas are marked in purple on the map.

### <svg viewBox="-1 -1 2 2"><circle r="1" fill="#cccccc"/></svg> Radio shadow

The satellites do not fly straight over the area they are sensing. Some steep slopes may therefore not be visible to the satellite. Such areas are marked in grey on the map. Neither satellite data or avalanche terrain will be represented in these areas.

### Coordinates

![Coordinates](/static/media/help/coordinates.png)

When the map is clicked once, a popup will show the relevant coordinate systems for the area. The above image shows the global **WGS 84** system and the current **UTM** zone as well as the Swedish coordinate system **SWEREF 99 TM**, shown since the clicked location is in Sweden. In Norway, multiple UTM systems may be shown, depending on area.

## Controls

### Date selector

![Date selector](/static/media/help/date.png)

Selects the date to show satellite data for. The selected date is the last one in a window of 6 or 12 days, so not all activity on the map will have happened on that date. The exact dates used in the image is visible in the image selector.

### Image selector

![Image selector](/static/media/help/image.png)

Selects what image to show. This will only show images that cover the area currently shown on the map. Therefore, images will appear or disappear as you move the map around.

The image name `B29A(2017-01-24--2017-01-30,6)` contains the following data.

* `B`: What satellite that captured the data. In this example it is Sentinel-1B.
* `29`: What orbit the satellite was in when the data was captured.
* `A`: If the satellite was on a descending (dawn) or ascending (dusk) orbit.
* `2017-01-24`: The first date of the time window of the image.
* `2017-01-30`: The last date of the time window (this should be identical to the value of the date selector).
* `6`: The length of the time window, the difference between the two dates. This is always 6 or 12.

Note that there may be multiple images to view on a given day. This is indicated by a small arrow to the right of this selector.

### Image toggle

![Image toggle](/static/media/help/toggle.png)

Removes the current image temporarily to make it easier to navigate.

### Help button

![Help button](/static/media/help/about.png)

Opens this help window.

## Presentations

* [Metria AB, 2019-02-07](static/presentations/190207/avanor_metria_2019-02-07.pdf)

## Data sources

* ©&nbsp;[ESA](http://www.esa.int/ESA) [(CC&nbsp;BY&#8209;SA&nbsp;3.0&nbsp;IGO)](https://creativecommons.org/licenses/by-sa/3.0/igo/)
  * [Sentinel&#8209;1&nbsp;SAR&nbsp;Level&#8209;1&nbsp;GRD](https://scihub.copernicus.eu/)
* ©&nbsp;[Kartverket](https://www.kartverket.no/) [(CC&nbsp;BY&nbsp;4.0)](https://creativecommons.org/licenses/by/4.0/)
  * [DTM&nbsp;10&nbsp;Terrengmodell](https://kartkatalog.geonorge.no/metadata/kartverket/dtm-10-terrengmodell-utm33/dddbb667-1303-4ac5-8640-7ec04c0e3918)
  * [N50&nbsp;Kartdata](https://kartkatalog.geonorge.no/metadata/kartverket/n50-kartdata/ea192681-d039-42ec-b1bc-f3ce04c189ac)
  * [Topografisk norgeskart 4 cache](https://kartkatalog.geonorge.no/metadata/kartverket/topografisk-norgeskart-4-cache/8f381180-1a47-4453-bee7-9a3d64843efa)
* ©&nbsp;[Lantmäteriet](https://www.lantmateriet.se/) [(CC0 1.0)](https://creativecommons.org/publicdomain/zero/1.0/legalcode.sv)
  * [GSD-Höjddata, grid 50+ hdb](https://www.lantmateriet.se/sv/Kartor-och-geografisk-information/Hojddata/GSD-Hojddata-grid-50-/)
  * [GSD-Höjddata, grid 50+ nh](https://www.lantmateriet.se/sv/Kartor-och-geografisk-information/Hojddata/GSD-Hojddata-grid-50-/)
  * [GSD-Översiktskartan vektor](https://www.lantmateriet.se/sv/Kartor-och-geografisk-information/Kartor/oversiktskartan1/)
  * [Topografisk webbkarta Visning, översiktlig](https://www.lantmateriet.se/sv/Kartor-och-geografisk-information/Geodatatjanster/Visningstjanster/?faq=7e09)
* ©&nbsp;[Naturvårdsverket](https://www.lavinprognoser.se/)
  * Lavinprognosområden

Generated images are subject to [CC&nbsp;BY&#8209;SA&nbsp;3.0&nbsp;IGO](https://creativecommons.org/licenses/by-sa/3.0/igo/).

## Contact and copyright

[info@avanor.se](mailto:info@avanor.se)

Avanor © 2018 [Aron&nbsp;Widforss](https://twitter.com/aronwidforss)
