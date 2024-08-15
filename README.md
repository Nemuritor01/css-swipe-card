# CSS-Swipe-Card

![readme-images-css-swipe-card](https://github.com/Nemuritor01/css-swipe-card/blob/main/.github/css-swipe-card.png)

CSS-Swipe-Card is a minimalist and customizable card, that lets you flick through a slider-carousel of cards.
This card is written in CSS and Java Script and not using any third party library.

Please note, that I´ve created this card for my personal use in the first place.
I´m not a full time developer, but an IT guy.
The code might not follow best practise methods. Contributors are welcome.

<br>

## Table of contents

**[`Installation`](#installation)**  **[`Configuration`](#configuration)** **[`Styling`](#styling)**  **[`Automations`](#automations)**  **[`Credits`](#credits)** 

<br>

## Installation

**Home Assistant lowest supported version:** 2023.9.0

<details>

<summary>With HACS</summary>

<br>

1. Open HACS (installation instructions are [here](https://hacs.xyz/docs/setup/prerequisites/).
2. Open the menu in the upper-right and select `Custom repositories`.
3. Enter the repository: `https://github.com/Nemuritor01/css-swipe-card`
4. Select the category `Lovelace`.
5. Select `ADD`.
6. Confirm the repository now appears in your HACS custom repositories list. Select `CANCEL` to close the custom repository window.
7. In the HACS search, type `CSS-Swipe-Card`.
8. Select the `CSS-Swipe-Card` Respository from the list.
9. Install the Repository.
10. Make sure to add to resources via one of the following:
    - If using the GUI Resource option, this should have been added automatically.
    - If using the `configuration.yaml`, open your `configuration.yaml` via File editor or other means and add:
      ```
      lovelace:
        mode: yaml
        resources:
          - url: /hacsfiles/css-swipe-card/css-swipe-card.js
            type: module
      ```
11. Reload your browser. If the card does not show, try to clear your browser cache.

</details>

<details>

<summary>Without HACS</summary>

<br>

1. Download these files: [css-swipe-card.js](https://github.com/Nemuritor01/css-swipe-card/blob/main/src/css-swipe-card.js)
2. Add these files to your `<config>/www` folder
3. On your dashboard click on the icon at the right top corner then on `Edit dashboard`
4. Click again on that icon and then click on `Manage resources`
5. Click on `Add resource`
6. Copy and paste this: `/local/css-swipe-card.js?v=1`
7. Click on `JavaScript Module` then `Create`
8. Go back and refresh your page
9. After any update of the file you will have to edit `/local/css-swipe-card.js?v=1` and change the version to any higher number

If it's not working, just try to clear your browser cache.`

</details>

## Configuration:

Add a card with type `custom:css-swipe-card`:

```yaml
- type: custom:css-swipe-card
  cards: []
```
## Parameters

| Name | Type | Default | Supported options | Description |
| ---- | ---- | ------- | ----------------- | ----------- |
| `cardId` | string | automatic calculation | a unique card ID you can use to trigger the card in automations |
| `template` | string | slider-horizontal | slider-horizontal, slider-vertical |
| `height` | string | | Any css option that fits in the `height` css value | Will force the height of the swiper container |
| `auto_height` | boolean | false | true, false | force the same heigth, based on the tallest card |
| `card_gap` | string | 0px | Any css option that fits in the `width` css value | |
| `timer` | number | 0 | Any number | Will reset the swiper to the first card after `timer` seconds |
| `pagination` | boolean | false | true, false | enable pagination bullets |
| `navigation` | boolean | false | true, false | enable navigation buttons |
| `navigation_next` | icon | none | any icon in home assistant (mdi:xxx; fas:xxx) | set icon in navigation button next |
| `navigation_prev` | icon | none | any icon in home assistant (mdi:xxx; fas:xxx) | set icon in navigation button previous |
| `custom_css` | | none | see [`Styling`](#styling) | customize design of the swipe card based on various shortcuts |

## Styles

Option `custom_css:`gives the ability to customize lots of css variables

| Variable | Default |
| -------- | ------- |
| `--slides-align-items` | center |
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
cardId: YourUniqueCardName
template: slider-horizontal
auto_height: true
pagination: true
navigation: true
card_gap: 2rem
timer: 3
navigation_next: mdi:chevron-right
navigation_prev: mdi:chevron-left
height: 10rem
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
## Automations:
Interactions with Home Assistant automations via input_number helper.
CSS-Swipe-Card is able to monitor and interact with a user created input_number helper. The card monitors, if an input_number.YourCardId helper is availble. If an input number is set, the card will scroll to this card and reset the input_number helper.

Instruction:
1. Define a unique cardId in your CSS-Swipe-Card config

2. Create an input_number helper.
   [create a number helper](https://www.home-assistant.io/integrations/input_number/)
    
- name: cardId of your css-swipe-card
- min: 0 (must be 0!)
- max: amount of cards (if 4 cards enter 4)
- step: 1

3. Use it in automations
Define a trigger and use action: input_number.set_value. The value should be the card you want to scroll to 
- 1 = first card
- 2 = second card
etc.

Example:

```yaml
alias: your-automation-name
description: ""
trigger:
  - platform: state
    entity_id:
      - input_boolean.your_switch
    from: "off"
    to: "on"
    for:
      hours: 0
      minutes: 0
      seconds: 0
condition: []
  - action: input_number.set_value
    metadata: {}
    data:
      value: 1
    target:
      entity_id: input_number.YourCardId
mode: single
```

## Credits

Credits to Bram Kragten. Some functions are based on his card code.
https://github.com/bramkragten/swipe-card/commits?author=bramkragten
