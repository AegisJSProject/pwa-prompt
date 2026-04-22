import { $text, $watch, $disabled, IotaElement } from '@aegisjsproject/iota';
import { html } from '@aegisjsproject/core/parsers/html.js';
import { css } from '@aegisjsproject/parsers/css.js';

export class PWAPrompt extends IotaElement {
	#name = this.use($text('No name provided'));
	#description = this.use($text('No description given.'));
	#installDisabled = this.use($disabled(true));

	static #resolvers = Promise.withResolvers();

	get html() {
		return html`
			<h1>Hello, ${this.#name}</h1>
			<p>${this.#description}</p>
			<button type="button" class="btn btn-primary" command="--install" ${this.#installDisabled}>
				<!-- PWA Install Badge -->
				<span>Install</span>
			</button>
			<button type="button" class="btn btn-danger" command="hide-popover">
				<!-- Close icon -->
				<span>Dismiss</span>
			</button>
		`;
	}

	get styles() {
		return css`:host {
			color-scheme: light dark;
		}`;
	}

	update(type, context) {
		switch(type) {
			case 'connected':
				this.#onConnect(context);
				break;

			case 'eventDispatched':
				this.#onEvent(context);
				break;
		}
	}

	#onConnect({ shadow }) {
		$watch(this.#name, console.log);
		this.popover = 'manual';
		shadow.querySelectorAll('button[command]').forEach(btn => btn.commandForElement = this);
		PWAPrompt.#resolvers.promise.then(() => this.#installDisabled.set(false));
	}

	async #onEvent({ event, internals }) {
		if (event.type === 'command') {
			switch(event.command) {
				case '--install':
					event.source.disabled = true;
					await this.#install(internals);
					break;
			}
		}
	}

	async #install(internals) {
		/**
		 * @type {BeforeInstallPromptEvent}
		 */
		const event = await PWAPrompt.#resolvers.promise;

		/**
		 * @type {"accepted"|"rejected"}
		 */
		const result = await event.prompt();
		internals.states.add(`install-${result}`);
		this.#installDisabled.set(true);
	}

	static {
		this.register('pwa-prompt');

		if ('BeforeInstallPromptEvent' in globalThis) {
			globalThis.addEventListener('beforeinstallprompt', event => {
				event.preventDefault();
				this.#resolvers.resolve(event);
			}, { once: true });
		} else {
			this.#resolvers.reject(new DOMException('`BeforeInstallPromptEvent` not supported.'));
		}
	}
}
