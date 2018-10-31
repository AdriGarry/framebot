!(function(e) {
	if ('object' == typeof exports && 'undefined' != typeof module) module.exports = e();
	else if ('function' == typeof define && define.amd) define([], e);
	else {
		('undefined' != typeof window
			? window
			: 'undefined' != typeof global
				? global
				: 'undefined' != typeof self
					? self
					: this
		).Recorder = e();
	}
})(function() {
	return (function e(t, n, o) {
		function r(a, s) {
			if (!n[a]) {
				if (!t[a]) {
					var c = 'function' == typeof require && require;
					if (!s && c) return c(a, !0);
					if (i) return i(a, !0);
					var f = new Error("Cannot find module '" + a + "'");
					throw ((f.code = 'MODULE_NOT_FOUND'), f);
				}
				var u = (n[a] = { exports: {} });
				t[a][0].call(
					u.exports,
					function(e) {
						var n = t[a][1][e];
						return r(n || e);
					},
					u,
					u.exports,
					e,
					t,
					n,
					o
				);
			}
			return n[a].exports;
		}
		for (var i = 'function' == typeof require && require, a = 0; a < o.length; a++) r(o[a]);
		return r;
	})(
		{
			1: [
				function(e, t, n) {
					'use strict';
					t.exports = e('./recorder').Recorder;
				},
				{ './recorder': 2 }
			],
			2: [
				function(e, t, n) {
					'use strict';
					var o = (function() {
						function e(e, t) {
							for (var n = 0; n < t.length; n++) {
								var o = t[n];
								(o.enumerable = o.enumerable || !1),
									(o.configurable = !0),
									'value' in o && (o.writable = !0),
									Object.defineProperty(e, o.key, o);
							}
						}
						return function(t, n, o) {
							return n && e(t.prototype, n), o && e(t, o), t;
						};
					})();
					Object.defineProperty(n, '__esModule', { value: !0 }), (n.Recorder = void 0);
					var r,
						i = e('inline-worker'),
						a = (r = i) && r.__esModule ? r : { default: r };
					var s = (n.Recorder = (function() {
						function e(t, n) {
							var o = this;
							!(function(e, t) {
								if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
							})(this, e),
								(this.config = { bufferLen: 4096, numChannels: 2, mimeType: 'audio/wav' }),
								(this.recording = !1),
								(this.callbacks = { getBuffer: [], exportWAV: [] }),
								Object.assign(this.config, n),
								(this.context = t.context),
								(this.node = (this.context.createScriptProcessor || this.context.createJavaScriptNode).call(
									this.context,
									this.config.bufferLen,
									this.config.numChannels,
									this.config.numChannels
								)),
								(this.node.onaudioprocess = function(e) {
									if (o.recording) {
										for (var t = [], n = 0; n < o.config.numChannels; n++) t.push(e.inputBuffer.getChannelData(n));
										o.worker.postMessage({ command: 'record', buffer: t });
									}
								}),
								t.connect(this.node),
								this.node.connect(this.context.destination);
							var r = {};
							(this.worker = new a.default(function() {
								var e = 0,
									t = [],
									n = void 0,
									o = void 0;
								function i() {
									for (var e = 0; e < o; e++) t[e] = [];
								}
								function a(e, t) {
									for (var n = new Float32Array(t), o = 0, r = 0; r < e.length; r++) n.set(e[r], o), (o += e[r].length);
									return n;
								}
								function s(e, t, n) {
									for (var o = 0; o < n.length; o++) e.setUint8(t + o, n.charCodeAt(o));
								}
								r.onmessage = function(c) {
									switch (c.data.command) {
										case 'init':
											(f = c.data.config), (n = f.sampleRate), (o = f.numChannels), i();
											break;
										case 'record':
											!(function(n) {
												for (var r = 0; r < o; r++) t[r].push(n[r]);
												e += n[0].length;
											})(c.data.buffer);
											break;
										case 'exportWAV':
											!(function(i) {
												for (var c = [], f = 0; f < o; f++) c.push(a(t[f], e));
												var u = void 0;
												u =
													2 === o
														? (function(e, t) {
																var n = e.length + t.length,
																	o = new Float32Array(n),
																	r = 0,
																	i = 0;
																for (; r < n; ) (o[r++] = e[i]), (o[r++] = t[i]), i++;
																return o;
														  })(c[0], c[1])
														: c[0];
												var l = ((h = u),
													(p = new ArrayBuffer(44 + 2 * h.length)),
													(v = new DataView(p)),
													s(v, 0, 'RIFF'),
													v.setUint32(4, 36 + 2 * h.length, !0),
													s(v, 8, 'WAVE'),
													s(v, 12, 'fmt '),
													v.setUint32(16, 16, !0),
													v.setUint16(20, 1, !0),
													v.setUint16(22, o, !0),
													v.setUint32(24, n, !0),
													v.setUint32(28, 4 * n, !0),
													v.setUint16(32, 2 * o, !0),
													v.setUint16(34, 16, !0),
													s(v, 36, 'data'),
													v.setUint32(40, 2 * h.length, !0),
													(function(e, t, n) {
														for (var o = 0; o < n.length; o++, t += 2) {
															var r = Math.max(-1, Math.min(1, n[o]));
															e.setInt16(t, r < 0 ? 32768 * r : 32767 * r, !0);
														}
													})(v, 44, h),
													v),
													d = new Blob([l], { type: i });
												var h, p, v;
												r.postMessage({ command: 'exportWAV', data: d });
											})(c.data.type);
											break;
										case 'getBuffer':
											!(function() {
												for (var n = [], i = 0; i < o; i++) n.push(a(t[i], e));
												r.postMessage({ command: 'getBuffer', data: n });
											})();
											break;
										case 'clear':
											(e = 0), (t = []), i();
									}
									var f;
								};
							}, r)),
								this.worker.postMessage({
									command: 'init',
									config: { sampleRate: this.context.sampleRate, numChannels: this.config.numChannels }
								}),
								(this.worker.onmessage = function(e) {
									var t = o.callbacks[e.data.command].pop();
									'function' == typeof t && t(e.data.data);
								});
						}
						return (
							o(
								e,
								[
									{
										key: 'record',
										value: function() {
											this.recording = !0;
										}
									},
									{
										key: 'stop',
										value: function() {
											this.recording = !1;
										}
									},
									{
										key: 'clear',
										value: function() {
											this.worker.postMessage({ command: 'clear' });
										}
									},
									{
										key: 'getBuffer',
										value: function(e) {
											if (!(e = e || this.config.callback)) throw new Error('Callback not set');
											this.callbacks.getBuffer.push(e), this.worker.postMessage({ command: 'getBuffer' });
										}
									},
									{
										key: 'exportWAV',
										value: function(e, t) {
											if (((t = t || this.config.mimeType), !(e = e || this.config.callback)))
												throw new Error('Callback not set');
											this.callbacks.exportWAV.push(e), this.worker.postMessage({ command: 'exportWAV', type: t });
										}
									}
								],
								[
									{
										key: 'forceDownload',
										value: function(e, t) {
											var n = (window.URL || window.webkitURL).createObjectURL(e),
												o = window.document.createElement('a');
											(o.href = n), (o.download = t || 'output.wav');
											var r = document.createEvent('Event');
											r.initEvent('click', !0, !0), o.dispatchEvent(r);
										}
									}
								]
							),
							e
						);
					})());
					n.default = s;
				},
				{ 'inline-worker': 3 }
			],
			3: [
				function(e, t, n) {
					'use strict';
					t.exports = e('./inline-worker');
				},
				{ './inline-worker': 4 }
			],
			4: [
				function(e, t, n) {
					(function(e) {
						'use strict';
						var n = (function() {
								function e(e, t) {
									for (var n in t) {
										var o = t[n];
										(o.configurable = !0), o.value && (o.writable = !0);
									}
									Object.defineProperties(e, t);
								}
								return function(t, n, o) {
									return n && e(t.prototype, n), o && e(t, o), t;
								};
							})(),
							o = function(e, t) {
								if (!(e instanceof t)) throw new TypeError('Cannot call a class as a function');
							},
							r = !!(e === e.window && e.URL && e.Blob && e.Worker),
							i = (function() {
								function t(n, i) {
									var a = this;
									if ((o(this, t), r)) {
										var s = n
												.toString()
												.trim()
												.match(/^function\s*\w*\s*\([\w\s,]*\)\s*{([\w\W]*?)}$/)[1],
											c = e.URL.createObjectURL(new e.Blob([s], { type: 'text/javascript' }));
										return new e.Worker(c);
									}
									(this.self = i),
										(this.self.postMessage = function(e) {
											setTimeout(function() {
												a.onmessage({ data: e });
											}, 0);
										}),
										setTimeout(function() {
											n.call(i);
										}, 0);
								}
								return (
									n(t, {
										postMessage: {
											value: function(e) {
												var t = this;
												setTimeout(function() {
													t.self.onmessage({ data: e });
												}, 0);
											}
										}
									}),
									t
								);
							})();
						t.exports = i;
					}.call(
						this,
						'undefined' != typeof global
							? global
							: 'undefined' != typeof self
								? self
								: 'undefined' != typeof window
									? window
									: {}
					));
				},
				{}
			]
		},
		{},
		[1]
	)(1);
});
