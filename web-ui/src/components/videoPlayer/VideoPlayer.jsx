// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as config from '../../config';

// Styles
import './VideoPlayer.css';

class VideoPlayer extends Component {
  constructor() {
    super ();
    this.state = {
      hover: false,
      maxMetaData: 10,
      metaData: [],
    }
  }

  componentDidMount() {
    const mediaPlayerScript = document.createElement("script");
    mediaPlayerScript.src = "https://player.live-video.net/1.1.2/amazon-ivs-player.min.js";
    mediaPlayerScript.async = true;
    mediaPlayerScript.onload = () => this.mediaPlayerScriptLoaded();
    document.body.appendChild(mediaPlayerScript);
  }

  mediaPlayerScriptLoaded = () => {
    // This shows how to include the Amazon IVS Player with a script tag from our CDN
    // If self hosting, you may not be able to use the create() method since it requires
    // that file names do not change and are all hosted from the same directory.

    const MediaPlayerPackage = window.IVSPlayer;

    // First, check if the browser supports the Amazon IVS player.
    if (!MediaPlayerPackage.isPlayerSupported) {
        console.warn("The current browser does not support the Amazon IVS player.");
        return;
    }

    const PlayerState = MediaPlayerPackage.PlayerState;
    const PlayerEventType = MediaPlayerPackage.PlayerEventType;

    // Initialize player
    const player = MediaPlayerPackage.create();
    player.attachHTMLVideoElement(document.getElementById("video-player"));

    // Attach event listeners
    player.addEventListener(PlayerState.PLAYING, () => {
        console.log("Player State - PLAYING");
    });
    player.addEventListener(PlayerState.ENDED, () => {
        console.log("Player State - ENDED");
    });
    player.addEventListener(PlayerState.READY, () => {
        console.log("Player State - READY");
    });
    player.addEventListener(PlayerEventType.ERROR, (err) => {
        console.warn("Player Event - ERROR:", err);
    });
    player.addEventListener(PlayerEventType.TEXT_METADATA_CUE, (cue) => {
        console.log('Timed metadata: ', cue.text);
        const metadataText = JSON.parse(cue.text);
        const productId = metadataText['productId'];
        this.props.setMetadataId(productId);
        const metadataTime = player.getPosition().toFixed(2);

        const { metaData, maxMetaData } = this.state;
        // only keep max 5 metadata records
        if (metaData.length > maxMetaData) {
          metaData.length = maxMetaData;
        }
        // insert new metadata
        metaData.unshift(`productId: ${productId} (${metadataTime}s)`);
        this.setState({ metaData });
    });

    // Setup stream and play
    player.setAutoplay(true);
    player.load(config.DEFAULT_VIDEO_STREAM);
    player.setVolume(0.5);
  }

  handleVideoHover = () => {
    this.setState({ hover: true });
  }

  handleVideoUnHover = () => {
    this.setState({ hover: false });
  }

  renderMetaData = () => {
    const { metaData } = this.state;
    const metaDataItems = metaData.map(element => (
      <div className="video-metadata-item" key={element}>{element}</div>
    ));
    return (
      <div className="video-metadata-container pd-x-1 pd-y-05 pos-absolute bg-inverted br-all-sm color-inverted">
        {metaDataItems}
      </div>
    )
  }

  render() {
    const { hover } = this.state;
    return (
      <div
        className="video-container pos-relative"
        onMouseEnter={this.handleVideoHover}
        onMouseLeave={this.handleVideoUnHover}
      >
        {hover && this.renderMetaData()}
        <div className="aspect-169 pos-relative full-width full-height">
          <video id="video-player" className="video-elem br-all pos-absolute full-width" playsInline muted></video>
        </div>
      </div>
    )
  }
}

VideoPlayer.propTypes = {
  setMetadataId: PropTypes.func,
  videoStream: PropTypes.string,
};

export default VideoPlayer;
