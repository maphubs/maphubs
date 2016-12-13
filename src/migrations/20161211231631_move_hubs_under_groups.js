
exports.up = function(knex, Promise) {
  return Promise.all([
    knex.raw(`
      CREATE TABLE omh.group_hubs (
        group_id text,
        hub_id text,
        CONSTRAINT grouphubsgroupfk FOREIGN KEY (group_id)
              REFERENCES omh.groups (group_id),
        CONSTRAINT grouphubshubfk FOREIGN KEY (hub_id)
              REFERENCES omh.hubs (hub_id),
        PRIMARY KEY (group_id, hub_id)
      ) 
    `),
    knex.raw(`
      INSERT INTO omh.groups (group_id, name, description, published) 
        SELECT hub_id || '-Hub', name || ' - Hub', description, true FROM omh.hubs;
    `),
    knex.raw(`
      INSERT INTO omh.group_hubs(group_id, hub_id) 
          SELECT hub_id || '-Hub', hub_id FROM omh.hubs;
            `),
    knex.raw(`
      INSERT INTO omh.group_images(group_id, image_id) 
          SELECT hub_id || '-Hub', image_id FROM omh.hub_images WHERE type = 'logo';
    `),
    knex.raw(`
      INSERT INTO omh.group_memberships (group_id, user_id, role, created_at, updated_at, invite_token, invite_accepted_at, status)
        SELECT hub_id || '-Hub', user_id, 
            CASE WHEN role = 'Administrator' THEN 'Administrator':: omh.group_role_enum
            ELSE 'Member'::omh.group_role_enum
            END as role,        
            created_at, updated_at, invite_token, invite_accepted_at, status FROM omh.hub_memberships;    
    `)
  ]);
};

exports.down = function(knex, Promise) {
  
};
