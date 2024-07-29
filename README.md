# CSS-Swipe-Card

![readme-images-bubble-card](https://github.com/Nemuritor01/css-swipe-card/blob/main/.github/css-swipe-card.png)

CSS-Swipe-Card is a minimalist and customizable card, that lets you flick through a slider-carousel of cards.
This card is written in CSS and Java Script and not using any third party library.

<br>

## Table of contents

**[`Installation`](#installation)**  **[`Configuration`](#configuration)**  **[`Styling`](#styling)**  **[`Credits`](#credits)** 

<br>

## Installation

**Home Assistant lowest supported version:** 2023.9.0

<details>

<summary>Without HACS</summary>

<br>

1. Download these files: [css-swipe-card.js]([https://github.com/Nemuritor01/css-swipe-card/blob/main/src/css-swipe-card.js])
2. Add these files to your `<config>/www` folder
3. On your dashboard click on the icon at the right top corner then on `Edit dashboard`
4. Click again on that icon and then click on `Manage resources`
5. Click on `Add resource`
6. Copy and paste this: `/local/css-swipe-card.js?v=1`
7. Click on `JavaScript Module` then `Create`
8. Go back and refresh your page
9. You can now click on `Add card` in the bottom right corner and search for `Bubble Card`
10. After any update of the file you will have to edit `/local/bubble-card.js?v=1` and change the version to any higher number

If it's not working, just try to clear your browser cache.`

</details>

## Configuration:

And add a card with type `custom:css-swipe-card`:

```yaml
- type: custom:css-swipe-card
  cards: []
```
## Parameters

| Name | Type | Default | Supported options | Description |
| ---- | ---- | ------- | ----------------- | ----------- |
| `width` | string | | Any css option that fits in the `width` css value | Will force the width of the swiper container |
| `height` | string | | Any css option that fits in the `height` css value |
| `auto_height` | boolean | false | true, false | force the same heigth, based on the tallest card |
| `card_gap` | string | 0px | Any css option that fits in the `width` css value | |
| `timer` | number | | Any number | Will reset the swiper to the first card after `timer` seconds |
| `pagination` | boolean | false | true, false | enable pagination bullets |
| `navigation` | boolean | false | true, false | enable navigation buttons |
| `navigation` | boolean | false | true, false | enable navigation buttons |
| `navigation_next` | icon | none | any icon in home assistant (mdi:xxx; fas:xxx) | set icon in navigation button next |
| `navigation_prev` | icon | none | any icon in home assistant (mdi:xxx; fas:xxx) | set icon in navigation button previous |
| `custom_css` | | none | see [`Styling`](#styling) | customize design of the swipe card based on various shortcuts |

## Styles

Option `custom_css:`gives the ability to customize lots of css variables

| Variable | Default |
| -------- | ------- |
| `--pagination-bullet-active-background-color` | var(--primary-text-color) |
| `--pagination-bullet-background-color` | var(--primary-background-color) |
| `--pagination-bullet-border` | 1px solid #999 |
| `--pagination-bullet-distance` | 10px |
| `--navigation-button-next-color` | var(--primary-text-color) |
| `--navigation-button-next-background-color` | var(--primary-background-color) |
| `--navigation-button-next-width` | 40px |
| `--navigation-button-next-height` | 40px |
| `--navigation-button-next-border-radius` | 100% |
| `--navigation-button-next-border` | none |
| `--navigation-button-prev-color` | var(--primary-text-color) |
| `--navigation-button-prev-background-color` | var(--primary-background-color) |
| `--navigation-button-prev-width` | 40px |
| `--navigation-button-prev-height` | 40px |
| `--navigation-button-prev-border-radius` | 100% |
| `--navigation-button-prev-border` | none |
| `--navigation-button-distance` | 10px |


Example code

```yaml
type: custom:css-swipe-card
template: slider-horizontal
auto_height: true
pagination: true
navigation: true
card_gap: 2rem
timer: 3
navigation_next: mdi:chevron-right
navigation_prev: mdi:chevron-left
height: 10rem
align_cards: flex-end
cards:
  - type: entity
    entity: sensor.your_sensor
  - type: entity
    entity: sensor.your_sensor
  - type: entity
    entity: sensor.your_sensor
custom_css:
  '--navigation-button-next-color': white
  '--navigation-button-next-background-color': cornflowerblue
  '--navigation-button-next-width': 50px
  '--navigation-button-next-height': 50px
  '--navigation-button-prev-color': white
  '--navigation-button-prev-background-color': orchid
  '--navigation-button-prev-width': 50px
  '--navigation-button-prev-height': 50px
  '--pagination-bullet-active-background-color': cornflowerblue
  '--pagination-bullet-distance': 5px
```

## Credits

Credits to Bram Kragten. Some functions are based on his card code.
https://github.com/bramkragten/swipe-card/commits?author=bramkragten