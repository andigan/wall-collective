module.exports =
  { 'initial': [
    { action: 'here-open-settings',
      icon: '/icons/ic_settings_black_24px.svg',
      imageReq: false,
      text: 'settings' },

    { action: 'here-open-info',
      icon: '/icons/ic_info_outline_black_24px.svg',
      imageReq: false,
      text: 'info' },

    { action: 'here-open-edit',
      icon: '/icons/ic_edit_black_24px.svg',
      imageReq: true,
      text: 'edit' },

    { action: 'here-add-image',
      icon: '/icons/ic_file_upload_black_24px.svg',
      imageReq: false,
      text: 'add' }
  ],

  'add': [
    { action: 'here-from-device',
      icon: 'icons/ic_tablet_mac_black_24px.svg',
      imageReq: false,
      text: 'device' },

    { action: 'here-from-igram',
      icon: '/icons/glyph-logo_May2016.png',
      imageReq: false,
      text: 'instagram' },

    // { action: 'here-textbox',
    //   icon: 'icons/ic_text_fields_black_24px.svg',
    //   text: 'textbox' }
  ],

  'settings': [
    { action: 'here-change-background-color',
      icon: '/icons/ic_palette_black_24px.svg',
      imageReq: false,
      text: 'color' },
    { action: 'here-reset-page',
      icon: '/icons/ic_replay_black_24px.svg',
      imageReq: false,
      text: 'reset page' },
    // { action: 'here-igram-logout',
    //   icon: '/icons/1x1.png',
    //   imageReq: false,
    //   text: 'igram logout' }
  ],

  'edit': [
    { action: 'here-open-draggers',
      icon: '/icons/ic_tune_black_24px.svg',
      imageReq: false,
      text: 'draggers' },
    { action: 'here-image-placeholder',
      icon: '/icons/1x1.png',
      imageReq: true,
      text: '' },
    { action: 'here-reset-image',
      icon: '/icons/ic_redo_black_24px.svg',
      imageReq: true,
      text: 'reset' },
    { action: 'here-remove-image',
      icon: '/icons/ic_delete_black_24px.svg',
      imageReq: true,
      text: 'remove' }
  ]

  };
