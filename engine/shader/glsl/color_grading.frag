#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

struct ColorGradingParams
{
    highp float color_grading_intensity;
};

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(push_constant) uniform _color_Grading_Params
{
    ColorGradingParams colorGradingParams;
};

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);

    highp vec4 color       = subpassLoad(in_color).rgba;
    
    highp float width = float(lut_tex_size.x);
    highp float numBlocks = width / _COLORS;

    highp float targetCell = numBlocks * color.b;

    highp float targetBlockFloor = floor(targetCell);
    highp float targetBlockCeil = ceil(targetCell);

    highp vec2 floorUV = vec2((color.r + targetBlockFloor) / width, color.g);
    highp vec2 ceilUV = vec2((color.r + targetBlockCeil) / width, color.g);

    // // Normalization
    // floorUV /= width;
    // ceilUV /= width;

    // Calculate final color
    highp vec4 floorColor = texture(color_grading_lut_texture_sampler, floorUV);
    highp vec4 ceilColor = texture(color_grading_lut_texture_sampler, ceilUV);
    highp vec4 finalColor = mix(floorColor, ceilColor, fract(targetCell));

    // Apply the final color with color grading intensity
    out_color = mix(color, finalColor, colorGradingParams.color_grading_intensity);
    out_color.a = 1.0f;
}
