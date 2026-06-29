import type { PageServerLoad } from './$types'
import { redirect } from '@sveltejs/kit'

export const load: PageServerLoad = async ({ params }) => {
  redirect(307, `/app/${params.teamName}/pipelines`)
}
