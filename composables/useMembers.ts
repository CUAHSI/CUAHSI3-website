// CUAHSI member institutions: the one registry, content/members/institutions.json (Jordan, 27 Nov 2026). Every page that asks
// "is this a member?" calls this; nothing else lists members. A member_institution value (jobs, graduate programs) names a
// registry entry; the validator fails a name the registry does not have.
type MemberInstitution = { name: string; category: 'gi' | 'pui' | 'nonprofit' | 'intl'; aliases?: string[] }

const normName = (s: string) => ` ${s.toLowerCase().replace(/['’]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim()} `

export async function useMembers() {
  const { data } = await useAsyncData('member-institutions', async (): Promise<MemberInstitution[]> => {
    const doc = await queryContent('members/institutions').findOne().catch(() => null)
    return Array.isArray(doc?.body) ? doc.body : []
  })
  const institutions = computed<MemberInstitution[]>(() => data.value ?? [])
  const names = computed(() => institutions.value.map(i => i.name))
  const nameSet = computed(() => new Set(names.value))

  // The forms a member's name takes in free text (a job's employer line): the name, "X, Y" also as "X at Y" ("University of
  // Texas, Austin" is also "University of Texas at Austin"), and the registry's aliases.
  const forms = computed(() => institutions.value
    .flatMap(i => [i.name, ...(i.name.includes(',') ? [i.name.replace(',', ' at')] : []), ...(i.aliases ?? [])])
    .map(normName).filter(n => n.trim()))

  // a free-text name contains a member's name (compared without case or punctuation; & as "and"). A match
  // followed by "of", "in" or "at" is not counted (Indiana University of Pennsylvania, University of Alabama in Huntsville are not
  // the members Indiana University and University of Alabama). A text match: a department that does not carry its university's
  // name is not recognised
  function textNamesMember(text: string) {
    const t = normName(text)
    return forms.value.some(m => {
      const i = t.indexOf(m)
      if (i < 0) return false
      return !/^(of|in|at) /.test(t.slice(i + m.length))
    })
  }

  // an entry's own answer: a registry name = a member, null = checked and not a member, absent = undecided (undefined)
  function declaredMember(value: unknown): boolean | undefined {
    if (value === null) return false
    if (typeof value === 'string' && value) return nameSet.value.has(value)
    return undefined
  }

  return { institutions, names, declaredMember, textNamesMember }
}
