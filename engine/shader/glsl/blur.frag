#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

struct BlurParams
{
    highp float screen_width;
    highp float screen_height;
};

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(location = 0) out highp vec4 out_color;

layout(push_constant) uniform _blur_Params
{
    BlurParams blurParams;
};

void main()
{
    highp float thresholdRatio = 0.3f;
    highp vec4 color = subpassLoad(in_color).rgba;

    highp vec2 centerPoint = vec2(blurParams.screen_width / 2.0f, blurParams.screen_height / 2.0f);
    highp vec2 curPos = gl_FragCoord.xy;

    highp float curThreshold = blurParams.screen_width * thresholdRatio;
    highp float t = clamp((distance(centerPoint, curPos) - curThreshold) / blurParams.screen_width, 0.0f, 1.0f);

    // out_color = vec4(gl_FragCoord.x / blurParams.screen_width, gl_FragCoord.y / blurParams.screen_height ,0.0f, 1.0f);
    out_color = mix(color, vec4(0.0f, 0.0f, 0.0f, 1.0f), min(t * 14.0f, 1.0f));
}
