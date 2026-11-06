"""Authenticate through the SDK without importing the optional `hf` CLI."""
from getpass import getpass


def main():
    from huggingface_hub import HfApi, login

    token = getpass('Hugging Face Write token (hidden): ').strip()
    if not token:
        raise SystemExit('No token entered.')
    login(token=token, add_to_git_credential=False)
    account = HfApi(token=token).whoami()
    print('Hugging Face account:', account['name'])


if __name__ == '__main__':
    main()
