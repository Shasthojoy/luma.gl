import test from 'tape-catch';
import {GL, createGLContext, Buffer} from 'luma.gl';
import {VertexArray} from 'luma.gl';
import {fixture} from '../setup';

test('WebGL#VertexArray construct/delete', t => {
  const {gl} = fixture;

  if (!VertexArray.isSupported(gl)) {
    t.comment('- VertexArray not supported, skipping tests');
    t.end();
    return;
  }

  t.throws(
    () => new VertexArray(),
    'VertexArray throws on missing gl context');

  const vao = new VertexArray(gl);
  t.ok(vao instanceof VertexArray, 'VertexArray construction successful');

  vao.delete();
  t.ok(vao instanceof VertexArray, 'VertexArray delete successful');

  vao.delete();
  t.ok(vao instanceof VertexArray, 'VertexArray repeated delete successful');

  t.end();
});

test('WebGL#VertexAttributes#enable', t => {
  const {gl} = fixture;

  const vertexAttributes = VertexArray.getDefaultArray(gl);

  const MAX_ATTRIBUTES = VertexArray.getMaxAttributes(gl);
  t.ok(MAX_ATTRIBUTES >= 8, 'vertexAttributes.getMaxAttributes() >= 8');

  for (let i = 0; i < MAX_ATTRIBUTES; i++) {
    t.equal(vertexAttributes.getParameter(GL.VERTEX_ATTRIB_ARRAY_ENABLED, {location: i}), false,
      `vertex attribute ${i} should initially be disabled`);
  }

  for (let i = 0; i < MAX_ATTRIBUTES; i++) {
    vertexAttributes.enable(i);
  }

  for (let i = 0; i < MAX_ATTRIBUTES; i++) {
    t.equal(vertexAttributes.getParameter(GL.VERTEX_ATTRIB_ARRAY_ENABLED, {location: i}), true,
      `vertex attribute ${i} should now be enabled`);
  }

  for (let i = 0; i < MAX_ATTRIBUTES; i++) {
    vertexAttributes.disable(i);
  }

  t.equal(vertexAttributes.getParameter(GL.VERTEX_ATTRIB_ARRAY_ENABLED, {location: 0}), true,
    'vertex attribute 0 should **NOT** be disabled');
  for (let i = 1; i < MAX_ATTRIBUTES; i++) {
    t.equal(vertexAttributes.getParameter(GL.VERTEX_ATTRIB_ARRAY_ENABLED, {location: i}), false,
      `vertex attribute ${i} should now be disabled`);
  }

  t.end();
});

test('WebGL#vertexAttributes#WebGL2 support', t => {
  const {gl2} = fixture;

  if (!VertexArray.isSupported(gl2, {instancedArrays: true})) {
    t.comment('- instanced arrays not enabled: skipping tests');
    t.end();
    return;
  }

  const vertexAttributes = VertexArray.getDefaultArray(gl2);

  const MAX_ATTRIBUTES = VertexArray.getMaxAttributes(gl2);

  for (let i = 0; i < MAX_ATTRIBUTES; i++) {
    t.equal(vertexAttributes.getParameter(GL.VERTEX_ATTRIB_ARRAY_DIVISOR, {location: i}), 0,
      `vertex attribute ${i} should have 0 divisor`);
  }

  t.end();
});

test('WebGL#VertexArray#getElementsCount', t => {
  const {gl} = fixture;

  const buffer1 = new Buffer(gl, {data: new Float32Array([1, 2, 3, 4, 5])});
  const buffer2 = new Buffer(gl, {data: new Float32Array([1, 2]), instanced: true});
  const buffer3 = new Buffer(gl, {data: new Float32Array([1, 2, 3])});
  const buffer4 = new Buffer(gl, {data: new Float32Array([1]), instanced: true});

  const va = new VertexArray(gl, {
    buffers: {
      [0]: {buffer: buffer1},
      [1]: {buffer: buffer2},
      [2]: {buffer: buffer3},
      [3]: {buffer: buffer4}
    }
  });

  let elementsCount = va.getElementsCount();

  t.equal(elementsCount.vertexCount, 3);
  t.equal(elementsCount.instanceCount, 1);

  // only bind non instanced buffers.
  va.setBuffers({
    [0]: {buffer: buffer1},
    [1]: {buffer: buffer3}
  }, {clear: true});
  elementsCount = va.getElementsCount();

  t.equal(elementsCount.vertexCount, 3);
  t.equal(elementsCount.instanceCount, 0);
});
