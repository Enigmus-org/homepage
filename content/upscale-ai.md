---
title: Upscale images using ML generative models
image: /images/upscale.webp
description: "meta description"
layout: text2image


---

### Upscale images using an AI generative model

The upscale feature is a functionality in many generative models that allows the user to increase the resolution of an image, often referred to as super-resolution.

In a generative model, such as a deep neural network, the upscale feature can be implemented differently. One popular method is to use a type of neural network called a convolutional neural network (CNN) to generate high-resolution versions of low-resolution images.
During training, the CNN is trained to take a low-resolution input image and output a high-resolution image that is as close as possible to the ground truth high-resolution image. This is typically achieved by minimizing a loss function that measures the difference between the generated and ground truth images.

To generate high-resolution images using the upscale feature, the user can input a low-resolution image into the trained model, and the model will produce an upscaled, high-resolution image as output.

The upscale feature is often used in applications such as image and video processing, medical imaging, and surveillance systems, where high-resolution images are essential for accurate analysis and decision-making. The upscale feature can be combined with other generative features, such as image-to-image translation, to produce even more sophisticated image manipulation capabilities.

### Upscale images using the RealESRGAN ML model

RealESRGAN is an enhanced version of the Enhanced Super-Resolution Generative Adversarial Network (ESRGAN) that uses a deep convolutional neural network to upscale images, producing high-resolution images from low-resolution inputs.

The upscale abilities of RealESRGAN are achieved through a multi-scale feature extraction network that extracts features from different scales of the input image. The extracted features are then processed by a deep residual network that maps the low-resolution features to high-resolution features, producing an output image that is closer in appearance to the ground truth high-resolution image.

The multi-scale feature extraction network in RealESRGAN is designed to capture features at different scales, allowing the model to extract more information from the input image. The network consists of a series of convolutional layers and downsampling operations that reduce the spatial resolution of the input image while increasing the number of channels.
The deep residual network in RealESRGAN consists of several residual blocks designed to learn the mapping between low-resolution and high-resolution features. Each residual block contains multiple convolutional layers with skip connections that allow the model to learn the residual image, which is then added to the input image to produce the high-resolution output.

RealESRGAN also incorporates a perceptual loss function that measures the difference between the generated image and the ground truth high-resolution image regarding perceptual features, such as color and texture. This loss function encourages the model to create high-quality images visually similar to ground truth images.

RealESRGAN incorporates adversarial training, which involves training a discriminator network to distinguish between the generated images and the ground truth images. The generator network is trained to produce images that can fool the discriminator network, resulting in higher-quality output images.
