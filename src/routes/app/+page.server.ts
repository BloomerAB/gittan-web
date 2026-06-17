import { redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'

export const load: PageServerLoad = async ({ parent }) => {
  const { teams } = await parent()
  if (teams.length > 0) {
    redirect(302, `/app/${teams[0].name}`)
  }
}
