import { Shadertoy } from '@/components/Shadertoy'

export default function Home() {
  return (
    <main >
      <Shadertoy
        shader={`
            vec3 palette( float t ) {
              vec3 a = vec3(0.5, 0.5, 0.5);
              vec3 b = vec3(0.5, 0.5, 0.5);
              vec3 c = vec3(1.0, 1.0, 1.0);
              vec3 d = vec3(0.263,0.416,0.557);

              return a + b*cos( 6.28318*(c*t+d) );
          }

          float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }

          float sdRhombus( in vec2 p, in vec2 b ) {
              p = abs(p);
              float h = clamp( ndot(b-2.0*p,b)/dot(b,b), -1.0, 1.0 );
              float d = length( p-0.5*b*vec2(1.0-h,1.0+h) );
              return d * sign( p.x*b.y + p.y*b.x - b.x*b.y );
          }

          void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
              vec2 uv = (fragCoord * 2.0 - iResolution.xy) / iResolution.y;
              vec2 uv0 = uv;
              vec3 finalColor = vec3(0.0);

              for (float i = 0.0; i < 3.0; i++) {
                  uv = fract(uv * 1.5) - 0.5;
                  vec2 p = uv;
                  vec2 m = (2.0*iMouse.xy-iResolution.xy)/iResolution.y;
                  vec2 ra = i + 0.4 + 0.3*cos( iTime + vec2(0.0,1.57) + 0.0 );

              	  float d = sdRhombus( p, ra );

                  vec3 col = palette(length(uv0) + i*.4 + iTime*.4);

                  d = sin(d*8. + iTime)/8.;
                  d = abs(d);
                  d = pow(0.015 / d, 1.1);

                  finalColor += col * d;
              }

              fragColor = vec4(finalColor, 1.0);
          }
        `}
      />
      <div>Content</div>
    </main>
  )
}
