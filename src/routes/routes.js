import combineRouter from 'koa-combine-routers'
import demoRouter from './demoRouter'

const router = combineRouter(
  demoRouter
)

module.exports = router
