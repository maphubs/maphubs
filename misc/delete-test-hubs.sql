delete from omh.hub_views where hub_id NOT IN ('template', 'moabidrc', 'test');
delete from omh.hub_layers where hub_id NOT IN ('template', 'moabidrc', 'test');

ALTER TABLE omh.images DISABLE TRIGGER ALL;
ALTER TABLE omh.hub_images DISABLE TRIGGER ALL;
delete from omh.images where image_id IN (select image_id from omh.hub_images where hub_id NOT IN ('template', 'moabidrc', 'test'));
delete from omh.hub_images where hub_id NOT IN ('template', 'moabidrc', 'test');
ALTER TABLE omh.images ENABLE TRIGGER ALL;
ALTER TABLE omh.hub_images ENABLE TRIGGER ALL;

delete from omh.hubs where hub_id NOT IN ('template', 'moabidrc', 'test');