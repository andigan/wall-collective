module.exports =
  { 'initial': [
    { action: 'open-settings',
      icon: '/icons/ic_settings_black_24px.svg',
      text: 'settings' },

    { action: 'open-app-info',
      icon: '/icons/ic_info_outline_black_24px.svg',
      text: 'info' },

    { action: 'open-edit',
      icon: '/icons/ic_edit_black_24px.svg',
      imageReq: false,
      text: 'edit' },

    { action: 'open-add',
      icon: '/icons/ic_file_upload_black_24px.svg',
      text: 'add' }
  ],

  'add': [
    { action: 'add-from-device',
      icon: 'icons/ic_tablet_mac_black_24px.svg',
      text: 'device' },

    { action: 'add-from-igram',
      icon: '/icons/glyph-logo_May2016.png',
      text: 'instagram' },

    // { action: 'add-textbox',
    //   icon: 'icons/ic_text_fields_black_24px.svg',
    //   text: 'textbox' }
  ],

  'settings': [
    { action: 'change-background-color',
      icon: '/icons/ic_palette_black_24px.svg',
      iconalt: 'change background color',
      text: 'color' },
    { action: 'reset-page',
      icon: '/icons/ic_replay_black_24px.svg',
      iconalt: 'reset page',
      text: 'reset page' },
    { action: 'grid-toggle',
      icon: '/icons/ic_grid_off_black_24px.svg',
      iconalt: 'toggle grid',
      text: 'grid off' },
    { action: 'igram-logout',
      icon: '/icons/ic_exit_to_app_black_24px.svg',
      iconalt: 'igram logout',
      igramTokenReq: true,
      text: 'igram logout' }
  ],

  'edit': [
    { action: 'open-switches',
      icon: '/icons/ic_tune_black_24px.svg',
      iconalt: 'open switches',
      text: 'draggers' },
    { action: 'nav-image-placeholder',
      icon: '/icons/1x1.png',
      iconalt: 'selected image',
      imageReq: true,
      text: '' },
    { action: 'reset-image',
      icon: '/icons/ic_redo_black_24px.svg',
      iconalt: 'reset page',
      imageReq: true,
      text: 'reset' },
    { action: 'remove-image',
      icon: '/icons/ic_delete_black_24px.svg',
      iconalt: 'remove image',
      imageReq: true,
      text: 'remove' }
  ],

  'altIcons': {
    'grid': {
      'on': '/icons/ic_grid_on_black_24px.svg',
      'off': '/icons/ic_grid_off_black_24px.svg'
    }
  }

  };
