define([
    'jquery',
    'arches',
    'knockout',
    'knockout-mapping',
    'geojson-extent',
    'views/components/workflows/new-tile-step'
], function($, arches, ko, koMapping, geojsonExtent, NewTileStep) {
    function viewModel(params) {
        var self = this;

        Object.assign(self, params.form);

        this.applicationAreaBounds = ko.observable();
        var color = 'rgb(102, 195, 91)';
        var strokecolor = '#fff';
        this.sources = {
            "related-application-area": {
                "type": "geojson",
                "generateId": true,
                "data": {
                    "type": "FeatureCollection",
                    "features": []
                }
            }
        };
        this.layers = [{
            "id": "related-application-area-polygon-fill",
            "source": "related-application-area",
            "type": "fill",
            "filter": [
                "==", "$type", "Polygon"
            ],
            "paint": {
                "fill-color": color,
                "fill-outline-color": color,
                "fill-opacity": 0.2
            }
        }, {
            "id": "related-application-area-polygon-under-stroke",
            "source": "related-application-area",
            "type": "line",
            "filter": [
                "==", "$type", "Polygon"
            ],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": strokecolor,
                "line-width": 4
            }
        }, {
            "id": "related-application-area-polygon-stroke",
            "source": "related-application-area",
            "type": "line",
            "filter": [
                "==", "$type", "Polygon"
            ],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": color,
                "line-width": 2
            }
        }, {
            "id": "related-application-area-under-line",
            "source": "related-application-area",
            "type": "line",
            "filter": [
                "==", "$type", "LineString"
            ],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": strokecolor,
                "line-width": 4
            }
        },  {
            "id": "related-application-area-line",
            "source": "related-application-area",
            "type": "line",
            "filter": [
                "==", "$type", "LineString"
            ],
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                "line-color": color,
                "line-width": 2
            }
        }, {
            "id": "related-application-area-point-stroke",
            "source": "related-application-area",
            "type": "circle",
            "filter": [
                "==", "$type", "Point"
            ],
            "paint": {
                "circle-radius": 6,
                "circle-opacity": 1,
                "circle-color": "#fff"
            }
        }, {
            "id": "related-application-area-point",
            "source": "related-application-area",
            "type": "circle",
            "filter": [
                "==", "$type", "Point"
            ],
            "paint": {
                "circle-radius": 4,
                "circle-color": color
            }
        }];
        this.map = ko.observable();

        self.tile().dirty.subscribe(function(dirty) {
            params.dirty(dirty)
        });

        const GeoJsonNode = 'b949053a-184f-11eb-ac4a-f875a44e0e11';
        const ConsultationLocationNodegroup = '152aa058-936d-11ea-b517-f875a44e0e11';
        const RelatedApplicationAreaNode = 'ba54228c-2f4e-11eb-abb5-acde48001122';
        var geoJSON = koMapping.toJS(self.tile().data[GeoJsonNode]);
        var tiles = self.getTiles(ConsultationLocationNodegroup);

        if (tiles.length > 0) {
            var resourceIds = koMapping.toJS(tiles[0].data[RelatedApplicationAreaNode]) || [];
            $.getJSON({
                url: arches.urls.geojson,
                data: {
                    resourceid:resourceIds.join(',')
                }
            }, function(geojson) {
                if (geojson.features.length > 0) {
                    if (!geoJSON || geoJSON.features.length === 0) {
                        self.applicationAreaBounds(geojsonExtent(geojson));
                    }
                    if (self.map()) {
                        self.map().getSource('related-application-area').setData(geojson);
                    } else {
                        self.map.subscribe(function(map) {
                            map.getSource('related-application-area').setData(geojson);
                        });
                    }
                }
            });
        }

    }

    ko.components.register('consultation-map-step', {
        viewModel: viewModel,
        template: {
            require: 'text!templates/views/components/workflows/consultation-map-step.htm'
        }
    });

    return viewModel;
});
