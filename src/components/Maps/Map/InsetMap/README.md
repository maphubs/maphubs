# MapHubs Inset Map

Configration is done from map settings panel

Here are the default parameters
```json
{
  "insetConfig": {
    "bottom": "30px",
    "collapsible": true,
    "collapsed": false,
    "maxZoom": 1.5,
    "padding": 10,
    "minHeight": "100px",
    "maxHeight": "145px",
    "minWidth": "100px",
    "maxWidth": "145px",
    "height": "25vw",
    "width": "25vw"
  }
 ```

In additional you can also set

```json
{
  "insetConfig":
    "fixedPosition": {
      "center": [0,0],
      "zoom": 12
    },
    "baseMap": "dark",
    }
}
```