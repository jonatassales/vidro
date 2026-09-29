export async function getRepositoryStars(): Promise<number | null> {
  try {
    const response = await fetch('https://api.github.com/repos/jonatassales/vidro', {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'vidro-website',
      },
      next: { revalidate: 3600 },
    })
    if (!response.ok) {
      return null
    }
    const data: unknown = await response.json()
    if (
      typeof data === 'object' &&
      data !== null &&
      'stargazers_count' in data &&
      typeof data.stargazers_count === 'number'
    ) {
      return data.stargazers_count
    }
    return null
  } catch {
    return null
  }
}
